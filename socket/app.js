import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config();

// The socket server stays intentionally small: connect users, relay messages, clean up.
const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);

  // One active socket per user is enough for this simple presence model.
  if (!userExists) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);

    if (receiver?.socketId) {
      // Only emit when the receiver is online; offline persistence is handled elsewhere.
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

const port = process.env.PORT || 4000;
io.listen(port);
console.log(`Socket server running on port ${port}`);
