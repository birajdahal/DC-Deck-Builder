var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');
var socketIO = require('socket.io');
var fs = require('fs');
var { Client } = require('pg');

const DC = require('./server/board');

async function setupBank() {
  const pass = fs.readFileSync('../dbinfo/password.txt').toString().trim();

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'DC',
    password: pass
  })

  client.connect();

  let res = await client.query("SELECT * FROM CARDS");

  return (new DC.Bank(res.rows));
}

function nameToUrl(nameArr, game) {
  return nameArr.map(name => {
    return game.bank.cards[name].url
  }); 
}

function getPlayerData(game, player) {
  let oDiscard = nameToUrl(game.players[1-player].discard, game);
  let lineup = nameToUrl(game.lineup, game);
  let superVillain = game.bank.cards[game.supervillain].url;
  let playStack = nameToUrl(game.playedCards, game);
  let hand = nameToUrl(game.players[player].hand, game);
  let discard = nameToUrl(game.players[player].discard, game);

  let playerData = {
    opponentHandCount: game.players[1-player].hand.length,
    opponentDeckCount: game.players[1 - player].deck.length,
    opponentDiscard: oDiscard,
 
    mainDeckCount: game.mainDeck.length,
    lineup: lineup,
    kicksCount: game.kicks,
    superVillain: superVillain,
    superVillainsCount: game.supervillains.length,
    weaknessesCount: game.weaknesses,
 
    playstack: playStack,
 
    hand: hand,
    deckCount: game.players[player].deck.length,
    discard: discard
  };

  return playerData;
}

async function setupServer(bank) {
  // setup web server
  var app = express();
  var compiler = webpack(config);

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));

  app.use(require('webpack-hot-middleware')(compiler));

  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'src','index.html'));
  });

  let bob = new DC.Player("Bob", "Superman");
  let tom = new DC.Player("Tom", "Batman");

  let game = new DC.Game(bob, tom, bank);

  game.startGame(0);

  const server = app.listen(8000, 'localhost', err => {
    if(err) throw err;

    console.log('\nListening at http://localhost:8000');
  });

  const io = socketIO(server);

  let clientCount = 0;

  io.on("connection", client => {
    clientCount++;

    let playerNum = clientCount - 1;

    console.log("User connected. Count: " + clientCount);
  
    client.emit("gameData", getPlayerData(game, playerNum)); 

    client.on("playcard", cardNum => {
      game.players[playerNum].playCard(cardNum); 
      client.emit("gameData", getPlayerData(game, playerNum));
    });

    client.on("disconnect", () => {
      clientCount--;
      console.log("User disconnected. Count: " + clientCount);
    });
  });
}

try {
  setupBank().then(bank => {
    try {
      setupServer(bank);
    }

    catch(error) {
      throw error;
    }
  });
}

catch(error) {
  console.log(error);
}
