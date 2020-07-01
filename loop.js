const _ = require('lodash')

const { getLightStatus, setBrightness, connect } = require('./light_comms')
const { readSensor } = require('./potentiometer')
const { isTouching } = require('./touch')
const { delay } = require('./utils')
const loop = async () => {
    // console.log('looping...')
    const touching = isTouching()
    const location = await readSensor()
    // console.log(touching);
    // console.log(location);

    if (touching) {
        setLight(location)
        // await delay(300)

        // console.log(result);

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
    console.log('setting to ', pos);

    setBrightness(pos * 100, 300)
}, 400);

(async () => {
    await connect()
    await delay(500)
    while (true) {
        await loop()
        await delay(50)
    }
})()
