const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const http = require('http');
const socketIO = require('socket.io');

const parser = new parsers.Readline({
  delimiter: '\r\n'
});

const port = new SerialPort('/dev/tty.wchusbserialfa1410', {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

port.pipe(parser);

const server = http.createServer();
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('A client connected');

  parser.on('data', (data) => {
    console.log('Received data from port: ' + data);
    socket.emit('data', data);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});