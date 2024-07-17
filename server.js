const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
// Обслуживание моделей
app.use('/models', express.static(path.join(__dirname, 'models')));
io.on('connection', (socket) => {

    socket.on('photo', (data) => {
        // Отправляем фото обратно клиенту
        socket.emit('photoResponse', data);
    });

    socket.on('disconnect', () => {

    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
