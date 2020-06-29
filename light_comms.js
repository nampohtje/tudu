const Net = require('net');
let client = new Net.Socket();

const { getLightStatus } = require('./discovery')

const sendMessage = (msg) => {
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

const loop = () => {
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

const closeAndRestart = async () => {

    console.log('restarting');


    client.destroy()

    await delay(3000)

    process.exit(1)
    await connect()
    await flash()
}

(async () => {
    try {
        await connect()
        await flash()
    }
    catch (e) {
        console.log(e)
    }

})()
