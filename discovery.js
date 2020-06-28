const PORT = 1982;

const ssdp = require("node-ssdp");

const my_ssdp = new ssdp.Client({ ssdpPort: PORT });

const getLightStatus = () => {
    return new Promise((resolve, reject) => {
        my_ssdp.once('response', (data) => {
            // console.log(data)
            resolve(data)
        });

        my_ssdp.search('wifi_bulb');

        setTimeout(() => {
            reject(new Error('ssdp timeout'))
        }, 3000)
    })
}

module.exports = {
    getLightStatus
}