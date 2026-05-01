const express = require("express");
const http = require("http");
const cors = require("cors");
const setupSocket = require("./src/socket");
const app = express();
const port = process.env.PORT || 4990;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://new-draw-frontend.vercel.app/"],
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
