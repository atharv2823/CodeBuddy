// Socket connection utility
export const socketConfig = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000",
  options: {
    autoConnect: false,
  },
};
