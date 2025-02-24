import React from "react";
import {format} from 'date-fns'
import { useState, useEffect } from "react";
import GithubAPI from './GithubAPI';
import { Card, Table, Tab, Nav, Alert, Button, InputGroup, Form, ListGroup } from "react-bootstrap";


const file_regex = /csaf_files\/OT\/white\/(?<year>\d{4})\/(?<name>icsa-\d{2}-\d{3}-\d{2}\.json)/

const githubapi = new GithubAPI();

const CSAFSearch = (props) => {

    const [searchVal, setSearchVal] = useState("");
    const [isInvalid, setIsInvalid] = useState(false);
    const [otVuls, setOtVuls] = useState([]);
    const [itVuls, setItVuls] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    
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
	    
	    
	    ot.push({name: name, type: type, published: formatDate(updated), title: title, updated: formatDate(updated), id: entry.id});
	});


	if (type == "OT") {
	    setOtVuls(ot);
	} else {
	    setItVuls(ot);
	}
    }


    useEffect(() => {

	if (otVuls.length > 0) {
	    setFilteredItems(prevArray => prevArray.concat(otVuls));
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

    const pullCSAF = async(name) => {

	await githubapi.getOne(name).then(response => {
	    props.setCSAF(response);
	}).catch((err) => {
	    console.log(err);
	})
    }
    

    useEffect(() => {

	if (otVuls.length == 0) {
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
	    <Form.Label>Advisory Search</Form.Label>
            <InputGroup className="mb-3">
		<Form.Control
                    placeholder="Search Advisories"
                    aria-label="Search Advisoriess"
                    aria-describedby="searchcves"
                    value={searchVal}
                    isInvalid={isInvalid}
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

	    <Table>
		<thead>
		    <tr>
			<th>ID</th>
			<th>Type</th>
			<th>Title</th>
			<th>Published</th>
			<th>Updated</th>
		    </tr>
		</thead>
		<tbody>
		{filteredItems.map((vul, index) => (
		    <tr key={`vul-${index}`}>
			<th>{vul.id}</th>
			<th>{vul.type}</th>
			<th><a href="#" onClick={(e)=>pullCSAF(vul.name)}>{vul.title}</a></th>
			<th>{vul.published}</th>
			<th>{vul.updated}</th>
		    </tr>
		))}
		</tbody>
	    </Table>

		    
		    
	    
	</div>
    )

}

export default CSAFSearch;
