const { Client } = require('pg')
const fs = require('fs')

const dbInfo = require('./cards.json');

const pass = fs.readFileSync('./password.txt').toString().trim()

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'DC',
  password: pass
})

client.connect()

dbInfo.forEach(card => {
  let q = "INSERT INTO cards (cardname, image, cardtype, cost, victorypoints, power) VALUES ('" + card.cardname + "', '" + card.image + "', '" + card.cardtype + "', " + card.cost + ", " + card.victorypoints + ", " + card.power + ")"; 
  
  client.query(q, (err, res) => {
    console.log(q)
    console.log(err, res);
  });
});
