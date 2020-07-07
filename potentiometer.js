const mcpadc = require('mcp-spi-adc');

let sensor
const openMcpChannel = async () => {
    return new Promise((resolve, reject) => {
        const tempSensor = mcpadc.openMcp3002(0, { speedHz: 2000 }, err => {
            if (err) {
                reject(err)
            }
            else {
                resolve(tempSensor)
            }
        })
    })
}

const readSensor = async () => {
    return new Promise((resolve, reject) => {
        sensor.read(async (err, reading) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(1 - reading.value)
            }
        })
    })
}

(async () => {
    sensor = await openMcpChannel()
})()

module.exports = {
    readSensor
}