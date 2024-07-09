import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './database/db.js';
import { getDocument, updateDocument } from './controller/document-controller.js';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

connectDB();

const io = new Server(server, {
    cors: {
        origin: ["https://docsyncing.vercel.app"],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
    socket.on('get-document', async (documentId) => {
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', (delta) => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        socket.on('save-document', async (data) => {
            await updateDocument(documentId, data);
        });
    });
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
