const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: 'https://web-chat-production-4bf4.up.railway.app' }
});

const PORT = process.env.PORT || 5001;

io.on('connection', socket => {
  console.log('User connected!', socket.id);

  socket.on('disconnect', reason => {
    console.log('User disconnected!', socket.id);
  });

  socket.on('set_username', username => {
    socket.data.username = username;
  });

  socket.on('message', msg => {
    // Suporte para objetos com text, type, name, etc.
    const message = {
      ...msg,
      author_id: socket.id,
      author: socket.data.username || 'Anônimo'
    };
    io.emit('receive_message', message);
  });
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));
