const socket = io('/');
let connected = false;

socket.emit("setup", userLoggedIn);
socket.on("connected", () => connected = true);
socket.on('message', messageReceived);
socket.on('notification recieved', popUpNotification);