const Net = require('net');
const { on } = require('process');

const client = new Net.Socket();
const server = new Net.Server();

server.listen(54321, function () {
    console.log(`Server listening for connection requests on socket localhost:${54321}`);
});


server.on('connection', function (socket) {
    console.log('A new client has established a connection');

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.
    // socket.write('Hello, client.');

    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function (chunk) {
        console.log(`Data received from client: ${chunk.toString()}`);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function (err) {
        console.log(`Error: ${err}`);
    });

    let state = 'on'
    let state2 = 'decrease'
    setInterval(() => {
        state = state === '1' ? '100' : '1'
        // state2 = state2 === 'increase' ? 'decrease' : 'increase'
        console.log('writing...', state, state2);

        socket.write(`{ "id": 1, "method": "set_bright", "params":[${state}, "smooth", 200]}\r\n`)
        // socket.write(`{ "id": 1, "method": "set_adjust", "params":["${state2}", "bright"]}\r\n`)
    }, 300)
});

client.connect({ port: 55443, host: '192.168.1.70' }, function () {

    console.log('TCP connection established with the server.');

    client.write('{"id":1,"method":"set_music","params":[1, "192.168.1.65", 54321]}\r\n');
})


// The client can also receive data from the server by reading from its socket.
client.on('data', function (chunk) {
    console.log(`Data received from the server:`, (chunk.toString()));
});

client.on('end', function () {
    console.log('Requested an end to the TCP connection');
});