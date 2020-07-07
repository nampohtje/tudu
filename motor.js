const Gpio = require('pigpio').Gpio;

const enable = new Gpio(18, { mode: Gpio.OUTPUT });
const pin1 = new Gpio(23, { mode: Gpio.OUTPUT });
const pin2 = new Gpio(25, { mode: Gpio.OUTPUT });


//enable.hardwarePwmWrite(20000, 900 * 1000)
enable.digitalWrite(1)
let is_on = {
	yes: true
}

const goUp = () => {
    pin1.digitalWrite(1)
    pin2.digitalWrite(0)
    is_on.yes = true
}

const goDown = () => {
    pin1.digitalWrite(0)
    pin2.digitalWrite(1)
    is_on.yes = true
}
const stahp = () => {
    pin1.digitalWrite(0)
    pin2.digitalWrite(0)
    is_on.yes = false
}

const isOn = () => {
	return is_on.yes
}

function shutdown() {
    enable.digitalWrite(0)
    pin1.digitalWrite(0)
    pin2.digitalWrite(0)
    console.log('shutting down..')
    process.exit(0)
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
    goUp,
    goDown,
    stahp,
    isOn
}