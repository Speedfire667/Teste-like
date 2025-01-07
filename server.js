const express = require('express');
const bodyParser = require('body-parser');
const mineflayer = require('mineflayer');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let likeCount = 0;

const bot = mineflayer.createBot({
    host: 'BYTEServer.aternos.me', // Endereço do servidor Minecraft
    port: 12444,       // Porta do servidor Minecraft
    username: 'BotName' // Nome do bot no Minecraft
});

bot.on('login', () => {
    console.log('Bot logado no servidor de Minecraft');
});

app.post('/updateLikes', (req, res) => {
    likeCount = req.body.likes;
    console.log(`Likes atualizados: ${likeCount}`);
    
    // Coloca uma TNT perto do jogador e faz ela explodir
    bot.chat('/summon minecraft:tnt ~ ~ ~ {Fuse:40}'); // A TNT explodirá em 2 segundos (40 ticks)
    
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
