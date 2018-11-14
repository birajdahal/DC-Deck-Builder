function shuffle(a) {
  for(let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));

    let x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

class Card {
  constructor(name, type, vp, power, effect) {
    this.name = name;
    this.type = type;
    this.vp = vp;
    this.power = power;
    this.effect = effect;
  }
}

class SHero {
  constructor(name) {
    this.name = name;
  }
}

class Buttons {

}

class Events {

}

class Bank {
  constructor(cardRows) {
    this.cardRows = cardRows;

    this.cards = this.getCards();
    this.startDeck = this.getStartDeck();

    this.startVillains = this.getStartVillains();
  }

  getCards() {
    let allcards = {};

    for(let i = 0; i < this.cardRows.length; i++) {
      let card = this.cardRows[i];
      
      allcards[card.cardname] = card;
    }

    return allcards;
  }

  getStartDeck() {
    let deck = [];

    for(let i = 0; i < this.cardRows.length; i++) {
      if(this.cardRows[i].cardname != "Kick" && this.cardRows[i].cardtype != "Other" && this.cardRows[i].cardtype != "Starter" && this.cardRows[i].cardtype != "Super Villain") {

        for(let j = 0; j < this.cardRows[i].count; j++) {
          deck.push(this.cardRows[i].cardname);
        }
      }
    }

    return deck;
  }

  getStartVillains() {
    return null;
  }
}

class Game {
  constructor(p1, p2, bank) {
    this.players = [p1, p2];
    this.turn = -1;

    this.mainDeck = bank.startDeck;

    this.lineup = [];
    this.kicks = 16;
    this.supervillain = "rasalghul";

    this.supervillains = [];
    this.weaknesses = 20;
    
    this.playedCards = [];
    this.turnInfo = {
      power: 0
    };

    this.info = null

    this.bank = bank;

    this.game = this;
  }

  startGame(turn) {
    console.log("Game started, first turn for " + this.players[turn].id);

    // handle stuff at the beginning of every game
    shuffle(this.mainDeck);

    for(let i = 0; i < 5; i++) { 
      this.refill();
    } 

    this.turn = turn;

    this.players[0].startGame(this.game);
    this.players[1].startGame(this.game);

    this.players[turn].turn = 1;
    this.players[1-turn].turn = 0;
  }

  refill() {
    let card = this.mainDeck.pop();
    this.lineup.push(card);
    
    console.log("Refilling " + card + " (main deck -> lineup)");
  }

  endTurn() {
    // handle cleanup effects

    // play area
    while(this.playedCards.length != 0) {
      let card = this.playedCards.pop();

      console.log(card + " was moved from play area to discard of player " + this.players[this.turn].id);

      this.players[this.turn].discard.push(card);
    }

    // hand
    while(this.players[this.turn].hand.length != 0) {
      let card = this.players[this.turn].hand.pop();

      console.log(card + " was moved from player " + this.players[this.turn].id + " hand to discard pile");

      this.players[turn].discard.push(card);
    }

    // refill lineup
    for(let i = this.lineup.length; i < 5; i++) {
      this.refill();
    }
    console.log(this.lineup);
    console.log(this.mainDeck.length);

    this.turnInfo.power = 0;

    // drawing phase
    this.players[this.turn].drawHand();

    // change players
    this.turn = 1 - this.turn;

    this.players[this.turn].turn = 1;
    this.players[1 - this.turn].turn = 0;

    console.log("\n***Turn shifted from player " + this.players[1-this.turn].id + " to player " + this.players[this.turn].id + "***\n")
  }

  playCard(card) {
    let power = this.bank.cards[card].power;

    this.turnInfo.power += power;

    this.playedCards.push(card); 

    console.log(card + " added to play zone. " + power + " power added");
    console.log("Total power for " + this.players[this.turn].id + ": " + this.turnInfo.power);
  }

  buyCard(loc, number) {
    switch(loc) {
      case "lineup":
        if(number > this.lineup.length) {
          console.log("ERROR! TRIED TO BUY LINEUP CARD #" + number + "BUT LINEUP ONLY HAS " + this.lineup.length + " CARDS");
          return;
        }  

        let card = this.lineup[number];

        let cardCost = this.bank.cards[card].cost;

        if(this.turnInfo.power < cardCost) {
          console.log("Tried to buy " + card + " but cost of " + cardCost + " is higher than current power of " + this.turnInfo.power); 
          return;
        }

        this.turnInfo.power -= cardCost;

        let actualCard = this.lineup.splice(number, 1);

        if(card != actualCard[0]) {
          console.log("SPLICED CARD WAS " + actualCard[0] + " WHICH IS NOT THE SAME AS CARD: " + card);
          throw "YOU MESSED UP CODING BRO";
        }

        this.players[this.turn].discard.push(card);

        console.log(card + " with cost of " + cardCost + " was bought from the lineup to " + this.players[this.turn].id + " discard pile");

        break;

      case "kicks":
        if(number > this.kicks) {
          console.log("ERROR! TRIED TO BUY KICK BUT THERE ARE NO MORE");
          return;
        } 

        if(this.turnInfo.power < 3) {
          console.log("Tried to buy kick but cost of 3 is greater than current power of " + this.turnInfo.power); 
          return;
        }

        this.turnInfo.power -= 3;
        this.kicks--;
        this.players[this.turn].discard.push("Kick");

        console.log("Kick was moved from kick stack to " + this.players[this.turn].id + " discard pile");

        break;

      default:
        console.log("NOT CODED YET!!");
        break;
    }

    console.log("Total power for " + this.players[this.turn].id + ": " + this.turnInfo.power);
  }
}

class Player {
  constructor(id, superHero) {
    this.id = id;
    this.superHero = new SHero(superHero);
    this.turn = -1;
    
    this.hand = [];
    this.discard = [];
    this.deck = ["Punch", "Punch", "Punch", "Punch", "Punch", "Punch", "Punch", "Vulnerability", "Vulnerability", "Vulnerability"];

    this.drawNumber = 5;

    this.game = null;
  }

  startGame(game) {
    this.game = game;

    shuffle(this.deck);
    
    this.drawHand();
  }

  drawHand() {
    if(this.hand.length != 0) {
      console.log("\nPlayer " + this.id + " tried to draw a new hand but had a hand already");
      return;
    }

    console.log("\nPlayer " + this.id + " drawing new hand");

    for(let i = 0; i < this.drawNumber; i++) {
      this.draw();
    }
  }

  draw() {
    if(this.deck.length == 0) {
      if(this.discard.length == 0) {
        console.log("Player " + this.id + " tried to draw but out of cards");
        return;
      }

      this.deck = this.discard;
      this.discard = [];
  
      shuffle(this.deck);

      console.log("Player " + this.id + " turned discard pile into deck");
    }

    let card = this.deck.pop();
    this.hand.push(card);

    console.log("Player " + this.id + " draws " + card); 
  }

  playCard(handNum) {
    if(handNum >= this.hand.length) {
      console.log("\nERROR! TRIED TO PLAY CARD IN HAND #" + handNum + " BUT HANDSIZE IS ONLY " + this.hand.length);
      return
    }

    let card = this.hand.splice(handNum, 1)[0];
    console.log("\nPlayer " + this.id + " played card " + card);

    this.game.playCard(card); 
  }  

  buyCard(loc, number) {
    console.log("\nPlayer " + this.id + " attempted to buy from " + loc + ", number " + number); 
    this.game.buyCard(loc, number);

    switch(loc) {
      case "lineup":
        
        break;

      case "kicks":

        break;

      default:
        console.log("NOT CODED YET!!");
    }
  }

  endTurn() {
    console.log("\nPlayer " + this.id + " has ended his turn");
    this.game.endTurn();
  }
}

module.exports = {
  Game,
  Player,
  Bank
}
