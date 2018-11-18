import React from 'react';
import { onData, playCard } from './api';

const cardback = "https://www.cryptozoic.com/sites/default/files/gallery/dc2_2.5x3.5_cards_back.jpg";
const kickImg = "http://www.nrdfeed.com/dcdb/scans/Kick.jpeg";
const cardfront = "https://www.cryptozoic.com/sites/default/files/artwork-images/dc_atlantis.png";

class App extends React.Component {
  constructor(props) {
    super(props);

    onData(data => {
      this.setState({
        opponentHandCount: data.opponentHandCount,
        opponentDeckCount: data.opponentDeckCount,
        opponentDiscard: data.opponentDiscard,

        mainDeckCount: data.mainDeckCount,
        lineup: data.lineup,
        kicksCount: data.kicksCount,
        superVillain: data.superVillain,
        superVillainsCount: data.superVillainsCount,
        weaknessesCount: data.weaknessesCount,

        playstack: data.playstack,

        hand: data.hand, 
        deckCount: data.deckCount, 
        discard: data.discard 
      });
    });

    this.state = {
      opponentHandCount: 0,
      opponentDeckCount: 0,
      opponentDiscard: [],

      mainDeckCount: 0,
      lineup: [],
      kicksCount: 0,
      superVillain: null,
      superVillainsCount: 0,
      weaknessesCount: 0,

      playstack: [],

      hand: [],
      deckCount: 0,
      discard: [],

      focusedCard: null
    };
  }

  setFocusedCard(cardURL) {
    this.setState({
      focusedCard: cardURL
    });
  }

  render() {
    return (
      <div id="container">
        <Log focusedCard={this.state.focusedCard}/>
        <div id="game">
          <OpponentArea handNum={this.state.opponentHandCount} deckNum={this.state.opponentDeckCount} sHero={"batman"} />
          <CommonArea kicks={this.state.kicksCount} deckNum={this.state.mainDeckCount} lineup={this.state.lineup} focusCard={card => this.setFocusedCard(card)} />
          <PlayArea playstack={this.state.playstack} focusCard={card => this.setFocusedCard(card)} />
          <PlayerArea hand={this.state.hand} deckNum={this.state.deckCount} sHero={"superman"} focusCard={card => this.setFocusedCard(card)} />
        </div>
      </div>
    );
  }
}

class Log extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let bigCard = null;

    if(this.props.focusedCard != null) {
      bigCard = <img src={this.props.focusedCard} /> 
    }

    return (
      <div id="log">
        <div id="bigCard">
          {bigCard} 
        </div>
        <div id="text"> </div>
      </div>
    );
  }
}

class OpponentArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let hand = [];
    for(let i = 0; i < this.props.handNum; i++) {
      hand.push(<Cardback key={i} />);  
    }

    return (
      <div id="opponent">
        <div id="opponentHand">
          {hand}
        </div>
        <div id="opponentSHero">
          <Card />
        </div>
        <div id="opponentDeck">
          <Deck size={this.props.deckNum}/>
        </div>
        <div id="opponentDiscard">
          <Discard />
        </div>
      </div>
    );
  }
}

class CommonArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let lineup = this.props.lineup.map((card, i) => <Card key={i} cardNum={i} card={card} focusCard={card => this.props.focusCard(card)} />);

    return (
      <div id="common">
        <div id="maindeck">
          <Deck size={this.props.deckNum} />
          <p>Main Deck</p>
        </div>
        <div id="buy">
          <div id="buycards">
            <div id="lineup">
              {lineup}          
            </div>

            <div id="kicks">
              <Kicks focusCard={() => this.props.focusCard(kickImg)} kicks={this.props.kicks}/>
            </div>
          </div>

          <div id="supervillain">
            <Card />
          </div>
        </div>

        <div id="info">
          <div id="supervillaincount">
            <Counter />
          </div>
          <div id="weaknesses">
            <Counter />
          </div>
        </div> 
      </div>
    );
  }
}

function Counter(props) {
  return (
    <div className="counter">
      <div className="icon"></div>
      <p>{5}</p>
    </div>
  );
}

function Deck(props) {
  return (
    <div className="card">
      <img className="deckimg" src={cardback} />
    </div>  
  );
}

function Kicks(props) {
  let kicks = null;
  if(props.kicks > 0) {
    kicks = <img className="cardimg" src={kickImg} onMouseEnter={() => props.focusCard(props.card)}/>
  }
  
  return (
    <div className="card">
      {kicks}
    </div>
  );
}

function Cardback(props) {
  return (
    <div className="card">
      <img className="cardimg" src={cardback} />
    </div>
  ); 
}

function Card(props) {
  return (
    <div className="card">
      <img className="cardimg" src={props.card} onMouseEnter={() => props.focusCard(props.card)} onClick={() => props.onClick()}/>
    </div>
  );
}

function Discard(props) {
  return (
    <div className="discard">
      <img className="discardimg" src={cardfront} />
    </div>
  );
}

class PlayArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let playedcards = this.props.playstack.map((card, i) => <Card key={i} cardNum={i} card={card} focusCard={card => this.props.focusCard(card)} />);

    return (
      <div id="play">
        <div id="playedcards">
          {playedcards}
        </div>
        <div id="playedinfo">Power: 5</div>
      </div>
    );
  }
}

function PlayedCards(props) {
  return (
    <div id="playedcards"></div>
  );
}

function PlayedInfo(props) {
  return (
    <div id="playedinfo"></div>
  );
}

class PlayerArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let hand = this.props.hand.map((card, i) => <Card key={i} cardNum={i} card={card} onClick={() => playCard(i)} focusCard={card => this.props.focusCard(card)}/>);

    return (
      <div id="player">
        <div id="top">
          <div id="turnbuttons">
            <button id="endturn">End Turn</button>
          </div>

          <div id="playerstacks">
            <div id="shero">
              <Card />
            </div>
            <div id="deck">
              <Deck />
            </div>
            <div id="discard">
              <Discard />
            </div>
          </div>

        </div>

        <div id="bottom">
          <div id="hand">
            {hand}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
