import { io } from 'socket.io-client';
const SERVER_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(SERVER_URL, {
  withCredentials: true,
});

export default socket;