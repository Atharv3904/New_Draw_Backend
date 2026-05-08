const express = require("express");
const http = require("http");
const cors = require("cors");
const setupSocket = require("./src/socket");
const app = express();
const port = process.env.PORT || 4990;

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

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("this is get req");
});

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`backend serever is running on port ${port}`);
});
