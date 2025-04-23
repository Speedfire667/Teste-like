// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bedrock = require('bedrock-protocol');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const MC_HOST = 'BYTEServer.aternos.me';
const MC_PORT = 12444;

let playerPosition = { x: 0, y: 0, z: 0 };
let blocks = [];

// Serve front-end
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Bedrock Bot Viewer</title>
    <style>body{margin:0}canvas{display:block}</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
    <script>
      const socket = io();

      let scene = new THREE.Scene();
      let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
      let renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const materials = {
        air: null,
        grass: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
        dirt: new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
        stone: new THREE.MeshBasicMaterial({ color: 0x888888 })
      };

      function drawBlocks(data) {
        while(scene.children.length > 0){ scene.remove(scene.children[0]); }
        data.forEach(b => {
          if(b.name === 'air') return;
          const geo = new THREE.BoxGeometry(1,1,1);
          const mat = materials[b.name] || new THREE.MeshBasicMaterial({ color: 0xffffff });
          const cube = new THREE.Mesh(geo, mat);
          cube.position.set(b.x, b.y, b.z);
          scene.add(cube);
        });
      }

      socket.on('update', (data) => {
        drawBlocks(data.blocks);
        camera.position.set(data.pos.x, data.pos.y + 1.6, data.pos.z);
        camera.lookAt(data.pos.x + 1, data.pos.y + 1.6, data.pos.z);
        renderer.render(scene, camera);
      });

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();
    </script>
  </body>
  </html>
  `);
});

// Iniciar bot Bedrock
const client = bedrock.createClient({
  host: MC_HOST,
  port: MC_PORT,
  username: 'ViewerBot'
});

client.on('spawn', () => {
  console.log('Bot conectado!');
  setInterval(() => {
    if (!client.entity) return;
    playerPosition = client.entity.position;
    blocks = [];
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -1; dy <= 3; dy++) {
        for (let dz = -3; dz <= 3; dz++) {
          const x = Math.floor(playerPosition.x + dx);
          const y = Math.floor(playerPosition.y + dy);
          const z = Math.floor(playerPosition.z + dz);
          client.requestBlock({ x, y, z }, (err, block) => {
            if (!err && block) {
              blocks.push({ x, y, z, name: block.name });
            }
          });
        }
      }
    }
    io.emit('update', { pos: playerPosition, blocks });
  }, 1000);
});

server.listen(PORT, () => console.log(`Web viewer em http://localhost:${PORT}`));


