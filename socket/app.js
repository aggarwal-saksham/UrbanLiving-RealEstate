import { Server, Socket } from "socket.io";

const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
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
    console.log(onlineUser);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver?.socketId) {
      io.to(receiver.socketId).emit("getMessage", data); // ✅ safe
    } else {
      console.log("Receiver is not online, message not emitted");
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

const port = process.env.PORT || 4000; // Use dynamic port or fallback to 4000
io.listen(port);
console.log(`Socket server running on port ${port}`);
