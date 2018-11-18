import openSocket from 'socket.io-client';

const socket = openSocket();

function onData(callback) {
  socket.on("gameData", gameData => callback(gameData));
}

function playCard(cardNum) {
  socket.emit("playcard", cardNum);
}

export { onData, playCard };
