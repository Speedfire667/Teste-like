const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let likes = 0; // Contador de likes

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Usuário conectado');

    // Enviar o número atual de likes
    socket.emit('updateLikes', likes);

    // Incrementar o contador de likes
    socket.on('like', () => {
        likes++;
        io.emit('updateLikes', likes); // Atualizar todos os clientes
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

// Inicializar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
