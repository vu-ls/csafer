import axios from 'axios';


export default class GithubAPI{

    constructor(url=null) {
	this.url = url
    }

    /*https://raw.githubusercontent.com/cisagov/vulnrichment/develop/2024/30xxx/CVE-2024-30015.json*/

    /* https://github.com/cisagov/CSAF/develop/csaf_files/OT/white/index.txt */


    getITFeed() {
	const url = "https://raw.githubusercontent.com/cisagov/CSAF/develop/csaf_files/IT/white/cisa-csaf-it-feed-tlp-white.json"
        return axios.get(url).then(response=>response.data);
    }

    getOTFeed() {
        const url = "https://raw.githubusercontent.com/cisagov/CSAF/develop/csaf_files/OT/white/cisa-csaf-ot-feed-tlp-white.json"
        return axios.get(url).then(response=>response.data);
    }
	

    getOT() {
	const url = "https://raw.githubusercontent.com/cisagov/CSAF/develop/csaf_files/OT/white/index.txt"
	return axios.get(url).then(response=>response.data);
    }


    getIT() {
	const url = "https://raw.githubusercontent.com/cisagov/CSAF/develop/csaf_files/IT/white/index.txt"
	return axios.get(url).then(response=>response.data);
    }
	

    
    getOne(url) {
	return axios.get(url).then(response => response.data);
	
    }
	

}
