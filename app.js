const socket = io();

// Elementos do DOM
const likesCount = document.getElementById('likes-count');
const likeButton = document.getElementById('like-button');

// Atualizar o contador de likes
socket.on('updateLikes', (count) => {
    likesCount.textContent = count;
});

// Enviar evento de like
likeButton.addEventListener('click', () => {
    socket.emit('like');
});
