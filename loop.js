const _ = require('lodash')

const { setBrightness, connect } = require('./light_comms')
const { readSensor } = require('./potentiometer')
const { isTouching } = require('./touch')
const { delay } = require('./utils')
const { getLightStatus } = require('./discovery')
const { goUp, goDown, stahp, isOn } = require('./motor')

let real_brightness = -1

const loop = async () => {
    // console.log('looping...')
    const touching = isTouching()
    const location = await readSensor()
    const motor_running = isOn()
    // console.log(touching);
    // console.log(location);
    if (touching && !motor_running) {
        stahp()
        setLight(location)
        real_brightness = Math.round(location * 100)
        // await delay(300)

        // console.log(result);

    }
    else {
        const pos = Math.round(location * 100)

        if (pos > real_brightness + 1) {
            //console.log('going up', pos, real_brightness)
            goDown()
        }
        else if (pos < real_brightness - 1) {
            //console.log('going down', pos, real_brightness)
            goUp()
        }
        else {
            //console.log('stahp')
            stahp()
           await  getRealBright()
        }
    }
    /*
        - Get touch sensor
        - get location
        - if not touching:
            - get current brightness
            - if brightness != location
                - send to location
            - else
                - stop motor

        - else
            - send location to light
    */
}

const setLight = _.throttle(async (pos) => {
    const rounded_pos = Math.round(pos * 100)

    setBrightness(rounded_pos, 300).catch(e => {
        console.log('error setting brightness: ', e)
    })
}, 400);

const getRealBright = async () => {
    const status = await getLightStatus().catch(e => {
        console.log(e)
        return { BRIGHT: real_brightness }
    })

    real_brightness = status.POWER === 'off' ? 0 : +status.BRIGHT
//     console.log({real_brightness})
}



const discoverForever = async () => {
    while (1) {
        const status = await getLightStatus().catch(e => {
            console.log(e)
            return { BRIGHT: real_brightness }
        })

        real_brightness = status.POWER === 'off' ? 0 : +status.BRIGHT
//         console.log('got', real_brightness)
        await delay(200)
    }
}

(async () => {

    await connect()
    await delay(500)
    //discoverForever()
    while (true) {
        await loop()
        //await delay(200)
    }
})()
