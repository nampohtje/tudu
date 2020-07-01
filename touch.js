const Gpio = require('pigpio').Gpio;

const button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    alert: true
});

let touching = {
    is: false
}

button.on('alert', (level) => {
    touching.is = !!level
});

const isTouching = () => touching.is

module.exports = {
    isTouching
}