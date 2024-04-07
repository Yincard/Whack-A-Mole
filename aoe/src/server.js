// Import dependencies
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');  // Import the cors package

const portPath = 'COM3';
const port = new SerialPort({
  path: portPath,
  baudRate: 9600, dataBits: 8, parity: 'none', stopBits: 1, flowControl: false
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));


const server = http.createServer();
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log('Web Client Connected');

  socket.on('disconnect', () => {
    console.log('Web Client Disconnected');
  });
});

port.on('open', () => {
  console.log('Arduino Connected');  // Print "Connected" when the port is opened successfully
});

port.on('error', (err) => {
  console.error('Error:', err.message);
});

parser.on('data', (data) => {
  console.log('Data Received from Arduino: ' + data);
  io.emit('data', data);  // Emit data to all connected clients
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Running Server: ${PORT}`);
});