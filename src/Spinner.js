import React, { Component } from 'react'

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

export default Spinner