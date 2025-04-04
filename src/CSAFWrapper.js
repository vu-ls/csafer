import React, { useState, useEffect } from 'react'
import {useLocation} from 'react-router-dom';
import {Card, Tab, Nav} from 'react-bootstrap';
import CSAFHtml from './CSAFHtml';
import CSAFSearch from './CSAFSearch';
import CSAFContext from './CSAFContext';
import CSAFJson from './CSAFJson';

const CSAFWrapper = () => {

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [activeTab, setActiveTab] = useState(searchParams.get('view') || "search");
    const [vuls, setVuls] = useState([]);
    const [components, setComponents] = useState([]);
    const [doc, setDoc] = useState({});
    const [result, setResult] = useState("");
    const [code, setCode] = useState({});
    const [csaf, setCsaf] = useState("");
    
    const setActiveTabNow = (props) => {
        setActiveTab(props);
    }
    
    function isJsonString(str) {
	try {
            JSON.parse(str);
	} catch (e) {
	    console.log(e);
            return false;
	}
	return true;
    }
    
    useEffect(() => {
        let ss = JSON.parse(sessionStorage.getItem("vuls")) || [];
        setVuls(ss);
	let cs = JSON.parse(sessionStorage.getItem("components")) || [];
	setComponents(cs);

	if (sessionStorage.getItem("csaf")) {
	    if (isJsonString(sessionStorage.getItem("csaf"))) {
		let rs = JSON.parse(sessionStorage.getItem("csaf"));
		setResult(rs);
		setCode(rs);
	    }
	}

    }, [])


    const setSelVul = (id) => {
	setCsaf(id);
    }


    useEffect(() => {
	if (csaf !== "") {
	    window.history.pushState({}, '', `?view=${activeTab}&id=${csaf}`);
	} else {
	    window.history.pushState({}, '', `?view=${activeTab}`);
	}

    }, [activeTab, csaf]);
    
    
    
    const setJSONResult = (res) => {

	setCode(res);
	if (res !== "") {
	    setResult(res);
	    sessionStorage.setItem("csaf", JSON.stringify(res, null, '\t'));
	}
	setActiveTabNow("html");
	window.scrollTo(0, 0);

    }
    

    const setNewResult = (res) => {

	setResult(res);
	if (isJsonString(res)) {
	    setCode(JSON.parse(res));
	} else {
	    setCode(res);
	    sessionStorage.setItem("csaf", res);

	}

    }
	
    

    const update = (data) => {
	
	if (data.document?.vulnerabilities.length > 0) {
	    let myVuls = result.document.vulnerabilities.map(vul => {

		let description = vul.notes?.find(note => note.category === "summary");
		if (!description) {
		    description = vul.title;
		} else {
		    description = description.text;
		}
		let references = vul.references?.map(ref => ref.url);

		let metrics = vul.scores?.map(score => {
		    let cvss = Object.keys(score).filter(key => {
			if (key.startsWith("cvss")) {
			    let version = score[key].version;
			    if (version === "3.1") {
				return {CVSSV3_1:{
				    baseScore: score[key].baseScore,
				    severity: score[key].baseSeverity,
				    vectorString: score[key].vectorString,
				    version: score[key].version
				}}
			    }
			}
		    })
		    return cvss;
		});
		
		return {
		    cve: vul.cve,
		    problem_types: [`${vul.cwe.id} ${vul.cwe.name}`],
		    title: vul.title,
		    description: description,
		    references: references,
		    acknowledgments: vul.acknowledgments,
		    date_public: vul.release_data,
		    metrics: metrics
		}
	    });		    
	    setVuls(myVuls);
	    console.log(myVuls);
	}

	
    }

    
    useEffect(() => {
	/*
	let date = new Date().toJSON();

	let data = {document: {
            category: "csaf_vex",
            csaf_version: "2.0",
            publisher: doc["publisher"],
            title: doc["title"],
	    tracking: {
		current_release_date: date,
		generator: {
		    engine: {
			name: "CSAF 2 HTML",
			version: "1.0"
		    }
		},
		id: doc["id"],
		initial_release_date: date,
		status: "draft",
		version: "1.0.0"
	    },
	    distribution: doc["distribution"],
	    notes: [
		{
		    text: doc["summary"],
		    title: "Case Summary",
		    category: "summary"
		}
	    ],
        }}

	let vjson = vuls.map((v) => {
	    return { 
		cve: v["cve"],
		cwe: {
		    id: v["problem_types"]["cweId"],
		    name: "description"
		},
		notes: [
		    {
			category: "summary",
			text: v["description"],
			title: "Description"
		    },
		    {
			category: "details",
			title: "SSVC",
			text: "SSVCv2/E:/"
		    }
		],
		title: v.title,
		references: v.references.map(ref => { return {category: "external", summary: "external references", url: ref}}),
		scores: v.metrics
	    }});
	data["document"]["vulnerabilities"] = vjson;	
	
        setResult(data);
	console.log(data);*/
    }, [doc, vuls]);
    
    return (
	<CSAFContext.Provider
	    value={{
		vuls,
		setVuls,
		components,
		setComponents,
		doc,
		setDoc
	    }}
	>
	<div className="App-body">
	    <div className="app-card">
	    <Card bg="light">
		<div className="nav-align-top mb-4">
		    <Tab.Container
                    defaultActiveKey={activeTab}
                    activeKey={activeTab}
                    id="report"
                    className="mb-3"
		    onSelect={setActiveTabNow}
                    >
                        <Nav variant="pills" className="mb-3" fill justify>
			    {/*<Nav.Item>
				<Nav.Link className="text-nowrap" eventKey="default">Document Properties</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
				<Nav.Link eventKey="addvuls">Vulnerabilities</Nav.Link>
			    </Nav.Item>
			    <Nav.Item>
				<Nav.Link eventKey="components">Components</Nav.Link>
				</Nav.Item>*/}
			    <Nav.Item>
				<Nav.Link eventKey="search">Advisories</Nav.Link>
			    </Nav.Item>
			    <Nav.Item>
				<Nav.Link eventKey="csaf">CSAF</Nav.Link>
			    </Nav.Item>
			    <Nav.Item>
				<Nav.Link eventKey="html">HTML</Nav.Link>
			    </Nav.Item>
			</Nav>
			
			<Tab.Content>
			    
			    {/*<Tab.Pane eventKey="default">
				<CSAFDocument
				    setValue={setDoc}
				/>
			    </Tab.Pane>
			    <Tab.Pane eventKey="addvuls">
				<CSAFVuls />
			    </Tab.Pane>
			    <Tab.Pane eventKey="components">
				<CSAFComponents />
				</Tab.Pane> */}

			    <Tab.Pane eventKey="search">
				<CSAFSearch
				    setCSAF={setJSONResult}
				    setSelected={setSelVul}
				/>
				
			    </Tab.Pane>
			    
			    <Tab.Pane eventKey="csaf">
				<div className="content-form">
				    <CSAFJson
					data = {result}
					setData={setNewResult}
					update={update}
				    />
				</div>
			    </Tab.Pane>
			    <Tab.Pane eventKey="html">
				{code?.document &&
				 <CSAFHtml
				     result={code}
				 />
				}
			    </Tab.Pane>
			    <Tab.Pane eventKey="tmpl">
			    </Tab.Pane>
			</Tab.Content>
			    
		    </Tab.Container>
		</div>
	    </Card>
	    </div>
	</div>
	    </CSAFContext.Provider>
    );


}

export default CSAFWrapper;
