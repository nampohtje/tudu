const mcpadc = require('mcp-spi-adc');
const Gpio = require('pigpio').Gpio;

const enable = new Gpio(18, { mode: Gpio.OUTPUT });
const pin1 = new Gpio(23, { mode: Gpio.OUTPUT });
const pin2 = new Gpio(25, { mode: Gpio.OUTPUT });

enable.hardwarePwmWrite(20000, 900 * 1000)

const fudge_factor = 1

const desired_pos = 50
 
const tempSensor = mcpadc.openMcp3002(0, { speedHz: 2000 }, err => {
    if (err) throw err;
	console.log('channel opened...')
	const readSensor = () => {
		tempSensor.read((err, reading) => {

		    if (err) throw err;
            //  console.log((reading));
			const pos = (reading.value * 100)

			console.log(pos - desired_pos)
			if( pos <  desired_pos + fudge_factor && pos > desired_pos - fudge_factor ){
            	stahp()
            }
            else if(pos > desired_pos){
            	goUp()
            }
            else if(pos < desired_pos){
            	goDown()
            }
            
            
		
            readSensor()
		});
	}

	readSensor()
    
});


setInterval(_ => {
        
    }, 10);

console.log('starting...')

const goUp = () => {
	 pin1.digitalWrite(1)
     pin2.digitalWrite(0)
     console.log('going up');
}

const goDown = () => {
	pin1.digitalWrite(0)
	pin2.digitalWrite(1)
	console.log('going down');
}
const stahp = () => {
	pin1.digitalWrite(0)
	pin2.digitalWrite(0)
	console.log('stahpping');
}





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