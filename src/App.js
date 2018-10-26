import React, { Component } from 'react';
import sortBy from "sort-by";
import firebase from "./firebase"
import './App.css';
import { Route } from 'react-router-dom';
import { Link } from 'react-router-dom';

const inputStyle = {
  width: '30px',
  height: '27px',
  borderRadius: '3px'
}
const btnStyle = {
  padding: '10px',
  border: 'black',
  margin: '5px',
  backgroundColor: 'white',
  borderRadius: '3px'
}
const btnSmStyle = {
  padding: '3px',
  border: 'black',
  margin: '10px',
  backgroundColor: 'white',
  borderRadius: '3px'
}
const formStyle = {
  display: 'inline-block'
}
const scoreTextStyle = {
  backgroundColor: '#3b5998',
  borderRadius: '7px',
  padding: '2px 7px',
  margin: '0px 10px'
}
const scoreTickerStyle = {
  display: 'inline-block',
  borderRadius: '7px',
  padding: '2px 5px',
  backgroundColor: '#3b5998',
  fontWeight: 'bold'
}
const editTeamListStyle = {
  textAlign: 'left'
}
const textBlobStyle = {
  textAlign: 'left',
  padding: '15px 0px',
  fontSize: '15px'
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
    const callback = () => console.log("New score submited.")
    this.setState({ tickerScore: 0 })
    this.props.onSubmitScore(teamDataWithNewScore, callback)
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
      <span>{name} <span style={scoreTextStyle}><b>{score}</b></span></span>  
      <Spinner onSubmitScore={props.onSubmitScore} data={props.data} />
      <hr></hr>
    </div>
    
  )
}

class Admin extends Component {
  componentDidMount() {
    const msgRef = firebase.database().ref('msg')
    msgRef.on('value', (snapshot) => {
      this.setState({
        msg: snapshot.val()
      })
    })
  }

  state = {
    textTeamName: '',
    textMemberName: '',
    isEditMode: false,
    textarea: 'ddd'
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  onSubmitAddTeam = (e) => {
    e.preventDefault()
    const teamsRef = firebase.database().ref('teams')
    const newTeam = {
      'name': this.state.textTeamName,
      'score': 0,
      'members': ['newTeamMember1', 'newTeamMember2', 'newTeamMember3']
    }
    teamsRef.push(newTeam)
    console.log(newTeam)
  }

  onEditOpen = (e) => {
    e.preventDefault()
    this.setState({isEditMode: !this.state.isEditMode})
  }

  onSubmitDelete = (e) => {
    e.preventDefault()
    console.log("delete: " + e.target.id)
    const { id } = e.target
    firebase.database().ref(`teams/${id}`).remove().then(()=>{
      console.log(console.log("deleted " + id))
    })
  }

  onSubmitTextarea = (e) => {
    e.preventDefault()
    firebase.database().ref(`msg`).push({ body: this.state.textarea})
  }

  render() {
    return(
      <section>
        <h3>Admin Controls</h3>
        <hr></hr>
        {this.props.teams.sort(sortBy('name')).map((team, index) => 
          (<Team key={index} rank={index+1} onSubmitScore={this.props.onSubmitScore} data={team} /> )
        )}
        {/* EDIT MODE STARTS */}
        <Link to="/" ><button style={btnStyle} disabled={this.state.isEditMode}>Public</button></Link>
        <button onClick={this.onEditOpen} style={btnStyle}>{this.state.isEditMode? "Close" : "Edit"}</button>
        {(this.state.isEditMode) && 
        <div>
          <ul style={editTeamListStyle}>
            {this.props.teams.map((team, index) => (
                <li key={index}>
                  {team.name}
                  <form id={team.id} onSubmit={this.onSubmitDelete} style={formStyle}>
                    <input type="submit" style={btnSmStyle} value={'Remove'}></input>
                  </form>
                </li>
            ))}
          </ul>
          <form onSubmit={this.onSubmitAddTeam}>
            <input type="text" name="textTeamName" value={this.state.textTeamName} onChange={this.handleChange} />
            <input type="submit" style={btnSmStyle} value={'Add Team'}></input>
          </form>
          {/* <form onSubmit={this.onSubmitTextarea}>
            <input type="textarea" name="textarea" value={this.state.textarea} onChange={this.handleChange} />
            <input type="submit" style={btnSmStyle} value={'Update'}></input>
          </form> */}
        </div>}
        <hr></hr>
        {/* EDIT MODE ENDS */}
      </section>
    )
  } 
}

const Main = (props) => {
  return(
    <section>
      <div>
        <table border="0">
          <tbody><tr><th>Rank</th><th>Team</th><th>Score</th></tr></tbody>
        </table>
        <hr></hr>
      </div>
      {props.teams.sort(sortBy('-score')).map((team, index) => 
        (
          <div key={team.id}>
            <table border="0">
              <tbody>
                <tr>
                  <td>#{index+1}</td>
                  <td><b>{team.name}</b></td>
                  <td style={scoreTickerStyle}>{team.score}</td>
                </tr>
              </tbody>
            </table>
            <hr></hr>
          </div>
        )
      )}
      <div style={textBlobStyle}>
        <p>{props.msg}</p>
      </div>
    </section>
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

    // const msgRef = firebase.database().ref('msg')
    // msgRef.on('value', (snapshot) => {
    //   let msgBody = snapshot.val().body
    //   this.setState({
    //     msg: msgBody
    //   })
    // })
  }

  state = { 
    teams: [],
    textTeamName: '',
    textMemberName: '',
    msg: ''
  };

  onSubmitScore = (teamData, clearTicker) => {
    console.log(teamData)
    // firebase
    firebase.database().ref(`teams/${teamData.id}`).update(teamData).then(()=>{
      clearTicker()
    })
  }

  render() {
    const teams = this.state.teams
    return (
      <div className="App">
        <header className="App-header">
          <Route exact path='/admin' render={() => (
            <Admin teams={teams} onSubmitScore={this.onSubmitScore} />  
          )} />
          <Route exact path='/' render={() => (
            <Main teams={teams} msg={this.state.msg} />  
          )} />
        </header>
      </div>
    );
  }
}

export default App;
