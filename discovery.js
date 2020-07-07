const PORT = 1982;

const ssdp = require("node-ssdp");

let my_ssdp = new ssdp.Client({ ssdpPort: PORT });

const getLightStatus = () => {
    return new Promise((resolve, reject) => {
        my_ssdp.once('response', (data) => {
            // console.log(data)
            resolve(data)
        });

        my_ssdp.search('wifi_bulb');

        setTimeout(() => {
        	//my_ssdp = new ssdp.Client({ ssdpPort: PORT })
        	//process.exit(1)
            reject(new Error('ssdp timeout'))
        }, 2000)
    })
}

module.exports = {
    getLightStatus
}