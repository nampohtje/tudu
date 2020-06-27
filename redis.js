const { promisify } = require("util");
const redis = require("redis");
const client = redis.createClient({
    host: '192.168.1.74'
});
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

(async () => {
    const get_res = await getAsync('test')
    console.log(get_res);
    console.log('all done');

})()
// getAsync.then(console.log).catch(console.error);