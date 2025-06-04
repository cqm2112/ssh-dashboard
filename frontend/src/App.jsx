import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('https://earliest-sources-ta-tournament.trycloudflare.com');

export default function App() {
  const [logs, setLogs] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const runCommand = (cmd) => {
    setLogs('');
    socket.emit('runCommand', cmd);
  };

function removeAnsi(str) {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );
}
  useEffect(() => {
    socket.on('log', (data) => {
       setLogs((prev) => prev + removeAnsi(data));
    });
    return () => socket.disconnect();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginData;
    if (username === 'admin' && password === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={loginData.username}
            onChange={e => setLoginData({ ...loginData, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={loginData.password}
            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Sbmeek Panel SSH</h1>
      <div className="button-grid">
 <      button onClick={() => runCommand( "bash -c 'export PATH=$HOME/.nvm/versions/node/v22.15.0/bin:$PATH && /home/sbmeek/.local/share/pnpm/pm2 logs 0'")}>Ver Logs</button>
        <button onClick={() => runCommand( "bash -c 'cd sb/job-list && /home/sbmeek/.nvm/versions/node/v22.15.0/bin/node index.js'")}>Ejecutar Script</button>
        <button onClick={() => runCommand("bash -c 'cd sb/homarket-core && ./run.sh'")}>Reiniciar Todo</button>
        <button onClick={() => runCommand("bash -c 'export PATH=$HOME/.nvm/versions/node/v22.15.0/bin:$PATH && /home/sbmeek/.local/share/pnpm/pm2 ps'")}>Estado PM2</button>
      </div>
      <pre className="log-box">{logs}</pre>
    </div>
  );
}
