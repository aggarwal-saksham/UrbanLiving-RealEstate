import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;

    if (!socketUrl) {
      setSocket(null);
      return undefined;
    }

    // Keep a single shared socket connection for the whole app session.
    const socketInstance = io(socketUrl);

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    // Let the socket server know who just came online after auth state settles.
    currentUser && socket?.emit("newUser", currentUser.id);
  }, [currentUser, socket]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
