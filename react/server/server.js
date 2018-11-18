const { Client } = require('pg');
const DC = require('./board');
const fs = require('fs')
 
const pass = fs.readFileSync('../../dbinfo/password.txt').toString().trim();

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'DC',
  password: pass
});

client.connect();

client.query("SELECT * FROM CARDS", (err, res) => {
  let bank = new DC.Bank(res.rows);
  
  let bob = new DC.Player("Bob", "Superman");
  let tom = new DC.Player("Tom", "Batman");

  let game = new DC.Game(bob, tom, bank) 

  game.startGame(0);

  for(let turn = 0; turn < 1; turn++) {
  
  for(let i = 0; i < 5; i++) {
    bob.playCard(0);
  }

  bob.buyCard("lineup", Math.floor(Math.random() * 5));

  bob.endTurn();

  for(let i = 0; i < 5; i++) {
    tom.playCard(0);
  }

  tom.buyCard("lineup", Math.floor(Math.random() * 5));

  tom.endTurn();

  }

  client.end();
});
