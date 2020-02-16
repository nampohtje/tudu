/*
	two modes: motorin and fingerin

	start in motorin mode

	if is fingerin mode
		if the light is not changing but the position is
			send new brightness to the light
		if the light is changing but the position is not
			go to motoring mode
		if neither is changing 
			do nothing

	if in motoring mode DONE
		if the light and position are different
			move pos to make the same
		if they are the same for 1 second
			go to fingerin mode
			
*/


const mcpadc = require('mcp-spi-adc');
const Gpio = require('pigpio').Gpio;
const _ = require('lodash')

let brightness = 0
let light

const Lookup = require("node-yeelight-wifi").Lookup;

let look = new Lookup();

look.on("detected",(_light) =>
{
	light = _light
    console.log("new yeelight detected: id="+light.id + " name="+light.name);
    light.on("stateUpdate",(light) => { 
    	console.log('new brightness is ', light.bright)
    	brightness = light.bright
    });
    light.on("failed",(error) => { console.log(error); });
    
});



//if something went wrong

const enable = new Gpio(18, { mode: Gpio.OUTPUT });
const pin1 = new Gpio(23, { mode: Gpio.OUTPUT });
const pin2 = new Gpio(25, { mode: Gpio.OUTPUT });
//enable.digitalWrite(1)
enable.hardwarePwmWrite(20000, 900 * 1000)

const fudge_factor = 3

let previous_brightness = 0
let previous_pos = 0

let mode = 'motorin'
 
const tempSensor = mcpadc.openMcp3002(0, { speedHz: 2000 }, err => {
    if (err) throw err;
	console.log('channel opened...')
	const readSensor = () => {
		tempSensor.read(async (err, reading) => {
		    if (err) throw err;
            //  console.log((reading));
			const pos = (reading.value * 104)

			if(mode === 'motorin'){
				//console.log(brightness, pos, pos - brightness)
				if(closeEnough(pos, brightness)){
	            	stahp()
	            	mode = 'fingerin'
	            }
	            else if(pos > brightness){
	            	goUp()
	            }
	            else if(pos < brightness){
	            	goDown()
	            }
			}
			
			if(mode === 'fingerin'){
			//	mode = 'motorin'
				
				if(!closeEnough(pos, brightness) && !closeEnough(pos, previous_pos, true)){
					setLight(pos)
				}
				if(brightness != previous_brightness && closeEnough(pos, previous_pos, true))	{
					mode = 'motorin'
				}
			}
			
            previous_brightness = brightness
            previous_pos = pos
		
            readSensor()
		});
	}

	readSensor()
    
});


console.log('starting...')

const goUp = () => {
	 pin1.digitalWrite(1)
     pin2.digitalWrite(0)
     //console.log('going up');
}

const goDown = () => {
	pin1.digitalWrite(0)
	pin2.digitalWrite(1)
	//console.log('going down');
}
const stahp = () => {
	pin1.digitalWrite(0)
	pin2.digitalWrite(0)
}

const closeEnough = (n1, n2, use_rounding = false) => {

	if(use_rounding){
		return Math.round(n1) === Math.round(n2)
	}
	if( n1 < n2 + fudge_factor && n1 > n2 - fudge_factor){
		return true
	}	
	else{
		return false
	}
}

const setLight = _.throttle(async (pos) => {
		console.log('setting light to ', pos)
		if(pos < 1){
			await light.setPower(false, 0)
		}
		else {
			await light.setPower(true, 0)
		}
		await light.setBright(pos, 200).catch(err => {
			console.log(err)
		})
}, 200)


//http://joseoncode.com/2014/07/21/graceful-shutdown-in-node-dot-js/
function shutdown() {
    enable.digitalWrite(0)
    pin1.digitalWrite(0)
    pin2.digitalWrite(0)
    console.log('shutting down..')
	process.exit(0)    
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);