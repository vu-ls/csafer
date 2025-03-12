import React from "react";
import {format} from 'date-fns'
import {useLocation} from "react-router-dom";
import { useState, useEffect } from "react";
import GithubAPI from './GithubAPI';
import { Table, Button, InputGroup, Form } from "react-bootstrap";
import "./App.css";
const file_regex = /csaf_files\/OT\/white\/(?<year>\d{4})\/(?<name>icsa-\d{2}-\d{3}-\d{2}\.json)/

const githubapi = new GithubAPI();

const CSAFSearch = (props) => {

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [searchVal, setSearchVal] = useState("");
    const [selected, setSelected] = useState(searchParams.get('id') || "");
    const [otVuls, setOtVuls] = useState([]);
    const [itVuls, setItVuls] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            searchCVEs();
        }
    }

    const searchCVEs = async () => {
    }


    const parseRolieFile = (file, type) => {

	let ot = [];

	file.feed?.entry?.forEach(entry => {
	    let name = entry.content?.src;
	    let published = entry.published;
	    let title = entry.title;
	    let updated = entry.updated;


	    ot.push({name: name, type: type, published: formatDate(published), title: title, updated: formatDate(updated), id: entry.id});
	});


	if (type === "OT") {
	    setOtVuls(ot);
	} else {
	    setItVuls(ot);
	}
    }


    useEffect(() => {

	if (otVuls.length > 0) {
	    setFilteredItems(prevArray => prevArray.concat(otVuls));
	}

	if (otVuls.length > 0 && searchParams.get('id')) {
	    let sel = otVuls.find(vu => vu.id === searchParams.get('id'));
	    if (sel) {
		pullCSAF(null, sel);
	    }
	}

    }, [otVuls]);


    useEffect(() => {

	if (itVuls.length > 0) {
            setFilteredItems(prevArray => prevArray.concat(itVuls));
	}

    }, [itVuls]);


    function formatDate(dateString, formatString = 'yyyy-MM-dd') {
        try {
            const parsedDate = format(new Date(dateString), formatString);
            return parsedDate;
        } catch (err) {
            return 'Invalid Date';
        }
    }


    const getITFeed = async() => {
	await githubapi.getITFeed().then(response => {
            parseRolieFile(response, 'IT');
        }).catch(err => {
            console.log(err);
        });

    }

    const getFeed = async() => {
	await githubapi.getOTFeed().then(response => {
	    parseRolieFile(response, 'OT');
	    getITFeed();
	}).catch(err => {
	    console.log(err);
	});
    }

    const getVuls = async () => {

	await githubapi.getOT().then(response => {
	    let ot = [];
	    let j = response.split(/\r?\n/);
	    j.forEach(f => {
		const found = f.match(file_regex);
		if (found) {
		    ot.push(found.groups);
		}
	    });
	    setOtVuls(ot);
	})

	await githubapi.getIT().then(response => {
	    setItVuls(response);
	})

    }

    const pullCSAF = async(e, vul) => {
	if (e) {
	    e.preventDefault();
	}

	if (searchParams.get('view')) {
	    console.log(`SETTING STATE ${vul.id}`);
            window.history.pushState({}, '', `?view=${searchParams.get('view')}&id=${vul.id}`);
	} else {
            window.history.pushState({}, '', `?id=${vul.id}`);
	}
	setLoading(true);
	setSelected(vul.id);
	props.setSelected(vul.id);
	await githubapi.getOne(vul.name).then(response => {
	    props.setCSAF(response);
	    setLoading(false);
	}).catch((err) => {
	    console.log(err);
	    setLoading(false);
	})
    }


    useEffect(() => {
	if (otVuls.length === 0) {
	    getFeed();
	}

    }, []);


    const handleSearch = (searchTerm) => {

	let allVuls = otVuls.concat(itVuls);

	const newFilteredItems = allVuls.filter(item =>
	    item.id.toLowerCase().includes(searchTerm.toLowerCase()) || item.title.toLowerCase().includes(searchTerm.toLowerCase())
	);
	setFilteredItems(newFilteredItems);
    };


    useEffect(() => {

	if (searchVal) {
	    handleSearch(searchVal);
	} else {
	    setFilteredItems(otVuls);
	}

    }, [searchVal]);



    return (
	<div className="content-form">

	    {loading &&
	     
	     <div className="loading style-2">
		 <div className="text-center">
                     <div className="lds-spinner">
                         <div></div>
                         <div></div>
                         <div></div>
                     </div>
                 </div>
	     </div>
	    }


	    <Form.Label>Advisory Search</Form.Label>
            <InputGroup className="mb-3">
		<Form.Control
                    placeholder="Search Advisories"
                    aria-label="Search Advisoriess"
                    aria-describedby="searchcves"
                    value={searchVal}
                    onChange={(e) =>
			setSearchVal(e.target.value)
                    }
                    name="searchcve"
                onKeyPress={(e) => onKeyDown(e)}
		/>

		<Button
                    variant="btn btn-outline-secondary"
                    id="button-addon2"
                    onClick={(e) => searchCVEs()}
		>
                    <i className="fas fa-search"></i>
		</Button>

	    </InputGroup>
	    <div className="table-wrapper">
	    <Table hover className="csafsearchtable">
		<thead>
		    <tr>
			<th width="170px">ID</th>
			<th>Type</th>
			<th>Title</th>
			<th width="140px">Published</th>
			<th width="140px">Updated</th>
		    </tr>
		</thead>
		<tbody>
		{filteredItems.map((vul, index) => (
		    <tr key={`vul-${index}`} className={selected === vul.id ? `table-row selected` : `table-row`} onClick={(e)=>pullCSAF(e, vul)}>
			<td>{vul.id}</td>
			<td>{vul.type}</td>
			<td>{vul.title}</td>
			<td>{vul.published}</td>
			<td>{vul.updated}</td>
		    </tr>
		))}
		</tbody>
	    </Table>
	    </div>


	</div>
    )

}

export default CSAFSearch;
