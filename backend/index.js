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

  socket.on('runCommand', (cmd) => {
    const command = typeof cmd === 'string' && cmd.trim().length > 0 ? cmd : 'ls';
    console.log(`Ejecutando comando: ${command}`);

    const sshProcess = spawn('ssh', [
      '-tt',
      '-o',
      'ProxyCommand=cloudflared access ssh --hostname ssh.sbmeek.com',
      'sbmeek@ssh.sbmeek.com',
      command
    ]);

    sshProcess.stdout.on('data', (data) => {
      console.log(`[stdout] ${data}`);
      socket.emit('log', data.toString());
    });

    sshProcess.stderr.on('data', (data) => {
      console.error(`[stderr] ${data}`);
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
app.get('/', (req, res) => {
  res.send('Servidor backend corriendo');
});
server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en http://0.0.0.0:${port}`);
});
