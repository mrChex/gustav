import React from 'react'
import {socket} from '../../socket'


export default React.createClass({

  getInitialState(){
    return {remove: null}
  },

  removeBranch(e) {
    this.setState({"remove": "progress"})
    socket.emit('delete branch', this.props.project.name, this.props.branch, (report) => {
      console.log('delete branch report',report);
      this.setState({remove: "done", report: report});
    });
  },

  render() {

    if(this.state.remove == "progress") { return(<h1>Removing...</h1>) }

    if(this.state.remove == "done") {return(<ul>
      {this.state.report.map((r) => {
        if(r[0] == "report") {return(<li><b>{r[1]}.{r[2]}.*</b></li>)}
        if(r[0] == "container") {
          if(r[2] == "ignored") {return(<li>Ignored container <b>{r[1]}</b>. {r[3].reason}</li>)}
          return(<li>{r[2]} container <b>{r[1]}</b></li>)
        }
        if(r[0] == "image") {return(<li>Image {r[1].slice(0,10)} - {r[2]}</li>)}
        if(r[0] == "files") {return(<li>Files {r[1]}</li>)}
        if(r[0] == "error") {return(<li>Error: {r[1]}</li>)}
        return(<li>Unknown action: {r}</li>)
      })}
    </ul>)}

    return (<div>
      <button type="button" className="btn btn-lg btn-danger" onClick={this.removeBranch}>Remove branch</button>
    </div>)
  }

});
