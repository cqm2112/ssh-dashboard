const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');

 socket.on('runCommand', (cmd = "ls") => {
  console.log(`Ejecutando comando: ${cmd}`);

  const sshProcess = spawn('ssh', [
    '-tt', // por si node.js remoto necesita TTY
    '-o',
    'ProxyCommand=cloudflared access ssh --hostname ssh.sbmeek.com',
    'sbmeek@ssh.sbmeek.com',
    
     cmd// <- muy importante usar bash -lc para que cargue entorno (como NVM, PATH, etc.)
  ]);

  sshProcess.stdout.on('data', (data) => {
      console.log(`Ejecutando comando: ${data}`);
    socket.emit('log', data.toString());
  });

  sshProcess.stderr.on('data', (data) => {
    socket.emit('log', `[stderr] ${data.toString()}`);
  });

  sshProcess.on('close', (code) => {
    socket.emit('log', `[SSH cerrado con código ${code}]`);
  });

  sshProcess.on('error', (err) => {
    socket.emit('log', `[Error en ssh]: ${err.message}`);
  });
});

});

server.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
