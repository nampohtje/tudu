const Gpio = require('pigpio').Gpio;

const button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    alert: true
});

let touching = {
    is: false
}

let timeout

button.on('alert', (level) => {

	if(!level){ //not touching
		timeout = setTimeout(() => {
			touching.is = false
		}, 2000)
	}
	else { //touching
		clearTimeout(timeout)
		touching.is = true
	}
    //touching.is = !!level
});

const isTouching = () => touching.is

module.exports = {
    isTouching
}