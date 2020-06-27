const mcpadc = require('mcp-spi-adc');
const Gpio = require('pigpio').Gpio;
const _ = require('lodash')
const Lookup = require("node-yeelight-wifi").Lookup;

const enable = new Gpio(18, { mode: Gpio.OUTPUT });
const pin1 = new Gpio(23, { mode: Gpio.OUTPUT });
const pin2 = new Gpio(25, { mode: Gpio.OUTPUT });

const fudge_factor = 3

let look = new Lookup();
let brightness = 0
let light
let previous_brightness = 0
let previous_pos = 0
let mode = 'motorin'
let power_on = true

enable.hardwarePwmWrite(20000, 900 * 1000)

look.on("detected", (_light) => {
    light = _light

    console.log("new yeelight detected: id=" + light.id + " name=" + light.name)

    light.on("stateUpdate", (light) => {
        console.log('new brightness is ', light.bright)
        brightness = light.bright
    })

    light.on("failed", console.log)
})

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

const readSensor = async (sensor) => {
    return new Promise((resolve, reject) => {
        sensor.read(async (err, reading) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(reading)
            }
        })
    })
}

const main = async () => {
    const temp_sensor = await openMcpChannel()

    const loop = async () => {
        const { value } = await readSensor(temp_sensor)
        const pos = value * 105 - 5

        if (mode === 'motorin') {
            if (closeEnough(pos, brightness)) {
                stahp()
                mode = 'fingerin'
            }
            else if (pos > brightness) {
                goUp()
            }
            else if (pos < brightness) {
                goDown()
            }
        }

        if (mode === 'fingerin') {
            if (!closeEnough(pos, brightness) && !closeEnough(pos, previous_pos, true)) {
                setLight(pos)
            }
            if (brightness != previous_brightness && closeEnough(pos, previous_pos, true)) {
                mode = 'motorin'
            }
        }

        previous_brightness = brightness
        previous_pos = pos

        loop()
    }

    loop()
}



const goUp = () => {
    pin1.digitalWrite(1)
    pin2.digitalWrite(0)
}

const goDown = () => {
    pin1.digitalWrite(0)
    pin2.digitalWrite(1)
}
const stahp = () => {
    pin1.digitalWrite(0)
    pin2.digitalWrite(0)
}

const closeEnough = (n1, n2, use_rounding = false) => {
    if (use_rounding) {
        return Math.round(n1) === Math.round(n2)
    }
    if (n1 < n2 + fudge_factor && n1 > n2 - fudge_factor) {
        return true
    }
    else {
        return false
    }
}

const setLight = _.throttle(async (pos) => {
    console.log('setting light to ', pos)
    if (pos < 1 && power_on) {
        power_on = false
        await light.setPower(false, 500)
    }
    else if (pos >= 1) {
        if (!power_on) {
            power_on = true
            await light.setPower(true, 500)
        }

        await light.setHSV([20, 100 - (pos * 0.4), pos], 500).catch(err => {
            console.log(err)
        })
    }
}, 600)

console.log('starting...')

main()

function shutdown() {
    enable.digitalWrite(0)
    pin1.digitalWrite(0)
    pin2.digitalWrite(0)
    console.log('shutting down..')
    process.exit(0)
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);