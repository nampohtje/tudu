const Color = require('color')
const Net = require('net');
let client = new Net.Socket();

const { getLightStatus } = require('./discovery')
const { goUp, goDown, stahp } = require('./motor')

const sendMessage = (msg) => {
    const now = Date.now()
    return new Promise((resolve, reject) => {
        client.once('data', function (data) {
            resolve((data.toString()))
        })

        setTimeout(() => {
            reject(new Error('light took too long to respond'))
        }, 1000)

        client.write(msg)
    })

}

const setBrightness = async (b, smooth) => {
    const hsv_arr = [10, 100 - (b * 0.4), b]

    let color = Color.hsv(hsv_arr);

    let hue = color.hue();
    let sat = color.saturationv();
    let bright = color.value();

    //"hue", "sat", "effect", "duration"
    let hsv_params =
        [
            hue,
            sat,
            `"smooth"`,
            smooth
        ];

    let bright_params =
        [
            bright,
            `"smooth"`,
            smooth
        ];

    const hsv_msg = `{ "id": 1, "method": "set_hsv", "params":[${hsv_params.join(',')}]}\r\n`
    const bright_msg = `{ "id": 1, "method": "set_bright", "params":[${bright_params.join(',')}]}\r\n`
    console.log(hsv_msg);
    console.log(bright_msg);

    const ret = await Promise.all([sendMessage(hsv_msg), sendMessage(bright_msg)])
    console.log(ret);

}

client.on('error', function (err) {
    console.log(`Client Error: ${err}`);
    closeAndRestart()
});

const delay = async (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

const connect = async () => {
    client = new Net.Socket();
    return new Promise((resolve, reject) => {
        client.connect({ port: 55443, host: '192.168.1.70' }, async function (err) {
            if (err) {
                reject(err)
            }
            else {
                console.log('connected!');
                resolve()
            }
        })

        setTimeout(() => {
            reject(new Error('client connect timeout'))
        }, 2000)
    }).catch(async e => {
        closeAndRestart()
        client.destroy()
        console.log('connect error', e);
        return connect()
    })
}


const flash = async () => {

    // client.write('{"id":1,"method":"set_music","params":[1, "192.168.1.65", 54321]}\r\n');
    let state = 'on'
    let state2 = 'decrease'

    while (true) {
        state = state === '80' ? '70' : '80'
        state2 = state2 === 'on' ? 'off' : 'on'
        console.log('writing...', state, state2);

        try {
            // const stuff = await sendMessage(`{ "id": 1, "method": "get_prop", "params":["bright"]}\r\n`)
            const stuff = await sendMessage(`{ "id": 1, "method": "set_bright", "params":[${state}, "smooth", 100]}\r\n`)

            console.log(stuff);
            const { BRIGHT } = await getLightStatus()
            console.log({ BRIGHT });

        } catch (err) {
            console.log(err)
            closeAndRestart()
            break
        }


        // client.write(`{ "id": 1, "method": "set_power", "params":["${state2}", "smooth", 200]}\r\n`)
        // client.write(`{ "id": 1, "method": "set_bright", "params":[${state}, "smooth", 100]}\r\n`)
        await delay(250)
    }
}


const closeAndRestart = async () => {

    console.log('restarting');


    client.destroy()

    await delay(3000)

    process.exit(1)
    await connect()
    await flash()
}

// (async () => {
//     try {
//         await connect()
//         await flash()
//     }
//     catch (e) {
//         console.log(e)
//     }

// })()

module.exports = {
    getLightStatus,
    connect,
    setBrightness
}