const { Server } = require("socket.io");

const rooms = new Map();
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://new-draw-frontend.vercel.app",
];

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin(origin, callback) {
        callback(null, isAllowedOrigin(origin));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("draw", (data) => {
      socket.to(data.roomId).emit("draw", data);
    });

    socket.on("clear-canvas", (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        room.elements = [];
      }
      socket.to(roomId).emit("clear-canvas");
    });

    socket.on("board-elements", (data) => {
      const room = rooms.get(data.roomId);

      if (room) {
        room.elements = data.elements;
      }

      socket.to(data.roomId).emit("board-elements", data.elements);
    });

    socket.on("chat-message", (data) => {
      const room = rooms.get(data.roomId);

      if (!room) {
        return;
      }

      const messageData = {
        username: data.username,
        text: data.text,
        time: new Date().toLocaleTimeString(),
      };

      room.messages.push(messageData);

      io.to(data.roomId).emit("chat-message", messageData);
    });

    socket.on("join-room", ({ username, roomId }) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          participants: new Map(),
          messages: [],
          elements: [],
        });
      }

      const room = rooms.get(roomId);

      socket.emit("chat-history", room.messages);
      socket.emit("board-elements", room.elements || []);

      room.participants.set(socket.id, username);

      console.log(`${username} joined room ${roomId}`);

      io.to(roomId).emit("room-users", {
        users: Array.from(room.participants.values()),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      rooms.forEach((room, roomId) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id);

          io.to(roomId).emit("room-users", {
            users: Array.from(room.participants.values()),
          });

          if (room.participants.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });
}

module.exports = setupSocket;
