import React, { useRef, useState, useEffect } from 'react'
import {Card, Badge, Alert, DropdownButton, Dropdown, InputGroup, FloatingLabel, Form, Container, Row, Col, Tab, Tabs, Nav, Button} from 'react-bootstrap';
import { isValid, parse, format, formatDistance } from 'date-fns';


const CSAFHtml = ({result}) => {

    const [products, setProducts] = useState([]);
    const [remDisplay, setRemDisplay] = useState([]);
    
    const getVulSummary = (vul) => {

	let text = vul.notes.find((note) => note.category == "summary")
	if (text) {
	    return text.text;
	}
	return ""
    }
	
    const getSummary = () => {

	let text = result.document.notes.find((note) => note.category == "summary")
	if (text) {
	    return text.text;
	} else {
	    return "";
	}

    }

    const showRemediations = (key) => {

	if (remDisplay.includes(key)) {
	    let newrem = remDisplay.filter(x => x != key);
	    setRemDisplay(newrem);
	} else {
	    setRemDisplay([...remDisplay, key]);
	}
    }
	
    
    const getAffectedProducts = (vul) => {
	let status = [];

	Object.keys(vul.product_status).forEach(stat => {
	    status.push({status: stat, products: vul.product_status[stat]});
	});

	return status;
    }

    const getProduct = (selected) => {
	return products.find(p => p.id == selected);
    }
	
    const getSSVC = (vul) => {

	let score = vul.notes.find((note) => note.title == "SSVC");
	if (score) {
	    return score.text;
	} else {
	    return "";
	}
    }
	
    const getVectorString = (vul) => {
	let cvss = {};
	vul.scores.forEach(x => {
	    if (Object.keys(x).includes("cvss_v3")) {
		cvss = x["cvss_v3"];
	    }
	});

	return cvss;
    }

    const getRemediation = (vul, pid) => {
	
	let remediations = vul.remediations.filter(r => r.product_ids.includes(pid));
	return remediations;
    }

    
    useEffect(() => {
	let temp_prod = [];
	result.product_tree.branches.forEach(pt => {
	    let vendor = ""
	    let product = ""
	    let version = ""
	    let name = ""
	    let prod_id = "";
	    /*vendor | product | version/range*/
	    if (pt.category === "vendor") {
		vendor = pt.name;
		pt.branches.forEach(pn => {
		    if (pn.category == "product_name") {
			product = pn.name;
			pn.branches.forEach(pv => {
			    version = pv.name;
			    name = pv.product.name;
			    prod_id = pv.product.product_id;
			    temp_prod.push({id: prod_id, name: name, version: version, product: product, vendor: vendor});
			    
			});
		    }
		});
	    }
	});
	setProducts(temp_prod);
    }, [result])


    function formatDate(dateString, formatString = 'yyyy-MM-dd') {
	try {
	    const parsedDate = format(new Date(dateString), formatString);
	    return parsedDate;
	} catch (err) {
	    return 'Invalid Date';
	}
    }
    
    return (
	result?.document &&
	    <div className="content-form">
		<h4>TLP: {result.document.distribution.tlp.label}</h4>
	     <h1>{result.document.tracking.id}: {result.document.title}</h1>
	     <hr/>
		<p>Release Date: {formatDate(result.document.tracking.initial_release_date, 'yyyy-MM-dd')}</p>
	     {result.document.tracking.current_release_date != result.document.tracking.initial_release_date &&
	      <p>Last Revised: { formatDate(result.document.tracking.current_release_date, 'yyyy-MM-dd')}</p>
	     }
	     <h1>Summary</h1>
	     <hr/>
	     <p>{getSummary()}</p>
	     {result.vulnerabilities?.length > 0 &&
	      <>
		  {result.vulnerabilities.map((vul, index) => {
		      let summary = getVulSummary(vul);
		      let products = getAffectedProducts(vul);
		      return (
			  <div key={`vul-${index}`} className="mb-3 border-bottom">
			      <h2>{vul.cve}: {vul.title}</h2>
			      <p>{summary}</p>
			      <h4>Affected Products</h4>
			      <table className="table striped w-100 mb-3">
				  <thead>
				  <tr>
				      <th>Vendor</th>
				      <th>Product</th>
				      <th>Version</th>
				      <th>Status</th>
				      <th>Remediations</th>
				  </tr>
				      </thead>
				  <tbody>
				      {products.map((prod, index) => (
					  
					  <React.Fragment key={`prod-${index}`}>
					      {prod.products.map((pid, idx) => {
						  let x = getProduct(pid);
						  let remediation = getRemediation(vul, pid);
						  if (x) {
						      return (
							  <React.Fragment key={`prod-${index}-${idx}`}>
							      <tr>
								  <td>{x.vendor}</td>
								  <td>{x.product}</td>
								  <td>{x.version}</td>
								  <td>{prod.status}</td>
								  {remediation.length > 0 ?
								   <>
								       <td>
									   <Button
									       onClick={(e)=>showRemediations(`prod-${index}-${idx}`)}
									       size="sm"
									       variant="primary"
									   >{remDisplay.includes(`prod-${index}-${idx}`) ?
									     <>Hide Remediations <i className="fas fa-caret-up"></i></>
									     :
									     <>View Remediations <i className="fas fa-caret-down"></i></>

									    }
									   </Button>
								       </td>
								   </>
								   :
								   <td></td>
								  }
							      </tr>
							      {remediation.length > 0 &&
							       <>
								   {remediation.map((r, k) => (
								       <tr key={`remediation-${index}-${idx}-${k}`} className={remDisplay.includes(`prod-${index}-${idx}`) ? "" : "hidden"}>
									   <td colSpan="3"><Badge bg="primary" className="mx-2">{r.category}</Badge>{r.details}</td>
								
									   <td colSpan="2"><a href={r.url} target="_blank">{r.url}</a>
									   </td>
								       </tr>
								   ))}
							       </>
							      }
							  </React.Fragment>
						      )
						  }
					      })}
					      
					  </React.Fragment>
				      ))}
				  </tbody>
			      </table>
			      <h4>Metrics</h4>
			      <h5>Problem Types: {vul.cwe.id}: {vul.cwe.name}</h5>

			      <h5>{getSSVC(vul)}</h5>
			      <h5>{getVectorString(vul).vectorString} Score: {getVectorString(vul).baseScore} <Badge bg="danger" pill>{getVectorString(vul).baseSeverity}</Badge></h5>
			      <p>{vul.scores.map((score, idx) => {
				  return (
				      <React.Fragment key={`vscore-${idx}`}>
					  {Object.keys(score).forEach((x, i) => {
				      
					      return (
						  <div key={`metrics-${idx}-${i}`}>
						      <p>CVSS version {score[x]["version"]}</p>
						      <p>Vector: {score[x]["vectorString"]}</p>
						      <p>Score: {score[x]["baseScore"]}</p>
						      <p>Severity: {score[x]["baseSeverity"]}</p>
						  </div>
					      )
					  })}
				      </React.Fragment>
				  )})}
			      </p>
			      
			      {vul.acknowledgments?.length > 0 &&
			       <>
				   <h4>Acknowledgments</h4>
				   {vul.acknowledgments?.map((ack, index) => {
				       return(
					   <p key={`ack-${index}`}>{vul.cve} was reported by {ack.names.join(", ")} {ack.organization ? `${ack.organization}` : ''}</p>
				       )
				   })}
			       </>
			      }
			      <h4>References</h4>
			      <ul className="list-unstyled">
			      {vul.references?.map((ref, index) => {
				  return(
				      <li className="mb-2" key={`ref-${index}`}><a target="_blank" href={ref.url}>{ref.url}</a> <Badge pill bg="primary">{ref.category}</Badge></li>
				  )
			      })}
			      </ul>
			      
			  </div>
		      )
		  })}
	      </>
	     }
		{result.document.acknowledgments?.length > 0 &&
		 <div className="mb-3">
		     <h1>Acknowledgements</h1>
		     <ul>
			 {result.document.acknowledgments.map((ack, index) => (
			     <li key={`doc-ack-${index}`}>Thanks to {ack.organization} for {ack.summary}</li>
			 ))}
		     </ul>
		 </div>
		}

		<h1>Revision History</h1>
	     <hr />
	     <div className="mb-3">
	     <table className="table w-50">
		 <thead>
		     <tr>
			 <th>Date</th>
			 <th>Version</th>
			 <th>Summary</th>
		     </tr>
		 </thead>
		 <tbody>
		     {result.document.tracking?.revision_history.map((rev, index) => (
			 <tr key={`rev-${index}`}>
			     <td>{format(new Date(rev.date), 'yyyy-MM-dd')}</td>
			     <td>{rev.number}</td>
			     <td>{rev.summary}</td>
			 </tr>
		     ))}
		 </tbody>
	     </table>
		 </div>
	     <h1>References</h1>
	     <hr/>

	     <ul className="list-unstyled">                                    
                 {result.document.references.map((ref, index) => {
                     return(
                         <li key={`doc-ref-${index}`}><a target="_blank" href={ref.url}>{ref.url}</a> <Badge pill bg="primary">{ref.category}</Badge></li>
                     )
                 })}                                                               
             </ul>  
	     
	     
	     
	 </div>
	
    );


}

export default CSAFHtml;
