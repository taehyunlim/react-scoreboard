import React, { Component } from 'react';
import sortBy from "sort-by";
import firebase from "./firebase"
import './App.css';

const inputStyle = {
  width: '30px'
}
const btnStyle = {
  height: '21px'
}

class Spinner extends Component {
  state = { 
    tickerScore: 0,
  };

  increment = () => {
    // const { value } = e.target
    const max = 50
    if (typeof max === 'number' && this.state.tickerScore >= max) return;
    this.setState({ tickerScore: this.state.tickerScore + 1 });
  }

  decrement = () => {
    // const { value } = e.target
    const min = -50
    if (typeof min === 'number' && this.state.tickerScore <= min) return;
    this.setState({ tickerScore: this.state.tickerScore - 1 });
  }

  handleChange = (e) => {
    const num = e.target.value ? parseInt(e.target.value) : 0
    if (typeof num === 'number') this.setState({ tickerScore: num  });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const updateScore = this.state.tickerScore
    const teamData = this.props.data
    const teamDataWithNewScore = Object.assign({}, teamData, { score: teamData.score + updateScore })
    const clearTicker = () => this.setState({ tickerScore: 0 })
    this.props.onSubmitScore(teamDataWithNewScore, clearTicker)
  }

  render() {
    return(
      <span className="input-number" style={this.props.style}>
        <button type="button" onClick={this.decrement} style={btnStyle}>&minus;</button>
        <input type="number" value={this.state.tickerScore} onChange={this.handleChange} style={inputStyle}></input>
        <button type="button" onClick={this.increment} style={btnStyle}>&#43;</button>     
        <button disabled={this.state.tickerScore===0} type="button" onClick={this.handleSubmit} style={btnStyle}>►</button>
      </span>
    )
  }
}

const Team = (props) => {
  // console.log(props.data)
  const { name, score, members } = props.data
  return(
    <div>
      <span>#{props.rank}  [{name}] Score: {score} </span>  
      <Spinner onSubmitScore={props.onSubmitScore} data={props.data} />
      <hr></hr>
    </div>
    
  )
}

class App extends Component {
  componentDidMount() {
    const teamsRef = firebase.database().ref('teams')
    teamsRef.on('value', (snapshot) => {
      console.log(snapshot.val())
      let firebaseTeams = snapshot.val()
      let initialTeams = [];
      for (let team in firebaseTeams) {
        initialTeams.push({
          id: team,
          name: firebaseTeams[team].name,
          score: firebaseTeams[team].score,
          members: firebaseTeams[team].members
        })
      }
      this.setState({
        teams: initialTeams
      })
    })
  }

  state = { 
    teams: [],
    textTeamName: '',
    textMemberName: ''
  };

  onSubmitScore = (teamData, clearTicker) => {
    console.log(teamData)
    // firebase
    firebase.database().ref(`teams/${teamData.id}`).update(teamData).then(()=>{
      clearTicker()
    })
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  onSubmitAdd = (e) => {
    e.preventDefault()
    const teamsRef = firebase.database().ref('teams')
    const newTeam = {
      'name': this.state.textTeamName,
      'score': 0,
      'members': ['newTeamMember1', 'newTeamMember2', 'newTeamMember3']
    }
    teamsRef.push(newTeam)
    this.setState({ 
      teams: [...this.state.teams, newTeam],
      textTeamName: '' 
    })
  }

  render() {
    const teams = this.state.teams
    return (
      <div className="App">
        <header className="App-header">

          <section>
            {teams.sort(sortBy('-score')).map((team, index) => 
              (<Team key={index} rank={index+1} onSubmitScore={this.onSubmitScore} data={team} /> )
            )}
          </section>

          <form onSubmit={this.onSubmitAdd}>
            <p>Admin Controls</p>
            <label>
              Team Name: 
            </label>
            <input type="text" name="textTeamName" value={this.state.textTeamName} onChange={this.handleChange} />
            <input type="submit" value="Add Team" />
          </form>

        </header>
      </div>
    );
  }
}

export default App;
