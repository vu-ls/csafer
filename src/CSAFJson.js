import React, { useRef, useState, useEffect} from 'react';
//import CSAFContext from './CSAFContext';
import { Button, Row, Col } from "react-bootstrap";
import cvssv3 from "./cvss-v3.0.json";
import cvssv31 from "./cvss-v3.1.json";
import cvssv2 from "./cvss-v2.0.json";
import csaf_schema from "./csaf_json_schema.json";
import Editor from '@monaco-editor/react';

const CSAFJson = ({data, setData, update}) => {

    const [code, setCode] = useState(null);
    const [markers, setMarkers] = useState([]);
    const monacoRef = useRef(null);
    const [colCount, setColCount] = useState("9");
    
    function handleEditorDidMount(editor, monaco) {
	// here is another way to get monaco instance
	// you can also store it in `useRef` for further usage
	monacoRef.current = monaco;
    }
    
    function editorWillMount(monaco) {

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
	    enableSchemaRequest: true,
            validate: true,
            schemas: [{
                uri: '',
                fileMatch: ['*'],
		schema: csaf_schema,
	    },
		      {
		          uri: 'cvss-v2.0.json',
			  schema: cvssv2
		      },
		      {
                          uri: 'cvss-v3.1.json',
                          schema: cvssv31
                      },
		      {
                          uri: 'cvss-v3.0.json',
                          schema: cvssv3
                      },

		     ]
        });
    }

    useEffect(() => {

	if (data) {
	    let rs = JSON.stringify(data, null, '\t');
	    setCode(rs);
	}

    }, [data]);
    


    function handleEditorValidation(markers) {

	// model markers
	if (code !== "{}") {
	    markers.forEach((marker) => console.log('onValidate:', marker));
	    setMarkers(markers);
	    /*
	    if (markers.length > 0) {
		setColCount("9");
	    } else {
		setColCount("12");
		}
		*/
	}
    }
    
    function handleEditorChange(value, event) {

	setCode(value);

	try {
	    let rs = JSON.parse(value);
	    setData(rs);
	} catch (err){
	}
   
    }

    const resetData = () => {
	setCode("");
	setData({});
	setColCount("9");
	setMarkers([]);
    }

    
    return (
	
	<div className="content-form">
	    <div className="d-flex justify-content-between align-items-center mb-3">
		<h3>CSAF JSON Editor</h3>
		<Button onClick={(e)=>resetData()} variant="danger">Reset Data</Button>
	    </div>
	    

	    <Row>
		<Col lg={colCount} className="json-e">
		    <div className="csaf-editor d-flex h-full bg-white">
			<Editor
			    width="100%"
			    height="100%"
			    theme="vs-white"
			    defaultLanguage="json"
			    automaticLayout={false}
			    value={code}
			    defaultValue=""
			    onChange={handleEditorChange}
			    onValidate={handleEditorValidation}
			    beforeMount={editorWillMount}
			    onMount={handleEditorDidMount}
			/>
		    </div>
		</Col>
		{markers.length > 0 &&

		<Col lg="3">
		     <h3>Validation</h3>
		     <ul>
			 {markers.map((mark, idx) => {
			     return (
				 <li key={`mark-${idx}`}><b>Line No. {mark.startLineNumber}</b> {mark.message} </li>

			     )
			 })}
		     </ul>
		</Col>
		}
	    </Row>

	</div>
    )

}


export default CSAFJson;

/*
*/
