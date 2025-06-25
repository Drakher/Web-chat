import React, { useRef } from 'react';
import io from 'socket.io-client';
import './Join.css'; // CSS separado para estilo

export default function Join({ setChatVisibility, setSocket }) {
  const usernmRef = useRef();

  const handleSubmit = async () => {
    const username = usernmRef.current.value.trim();
    if (!username) return;

    const socket = await io.connect('http://localhost:5001');
    socket.emit('set_username', username);
    setSocket(socket);
    setChatVisibility(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="join-container">
      <div className="join-box">
        <h1>Bem-vindo</h1>
        <input
          type="text"
          ref={usernmRef}
          onKeyDown={handleKeyDown}
          placeholder="Digite seu nome"
        />
        <button onClick={handleSubmit}>Entrar</button>
      </div>
    </div>
  );
}
