const Gpio = require('pigpio').Gpio;

const button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    alert: true
});

// button.on('interrupt', (level) => {
//     console.log(level)
// });

button.on('alert', (level) => {
    console.log(level)
});

setInterval(() => { })