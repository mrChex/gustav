import React from 'react';
import {socket} from '../../socket';
import ClassNames from 'classnames';
import About from './container_about';
import Logs from './container_logs';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState(keep_tab) {
    let name, tab = null;
    if(this.props.name) {
      name = this.props.name;
      tab = this.props.tab;
    } else {
      name = this.context.router.getCurrentParams().name;
      tab = this.context.router.getCurrentParams().tab;
    }

    if(!tab) { tab = "logs" }

    if(keep_tab && this.state.tab) { tab = this.state.tab }

    return {"name": name,
            "displayName": name,
            "tab": tab,
            "container": null,
            "error": null}
  },

  componentDidMount() {
    socket.emit('container inspect', this.state.name, (err, container) => {
      if(err) {
        this.setState({error: err})
      } else {
        this.setState({container: container,
                       displayName: container['Name']})
      }
    });
  },

  componentWillReceiveProps() {
    this.refresh();
  },


  refresh(keep_tab) {
    this.setState(this.getInitialState(keep_tab), () => {
      this.componentDidMount()
    });
  },

  containerStop() {
    let {Id} = this.state.container;
    this.setState({container: null});
    socket.emit('container stop', Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER STOP', err, data);
      this.refresh(true)
    });
  },

  containerStart() {
    let {Id} = this.state.container;
    this.setState({container: null});
    socket.emit('container start', Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER START', err, data);
      this.setState({"tab": "logs"});
      this.refresh(true)
    });
  },

  containerReStart() {
    let {Id} = this.state.container;
    this.setState({container: null});
    socket.emit('container restart', Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER RESTART', err, data);
      this.setState({"tab": "logs"});
      this.refresh(true)
    });
  },

  render() {

    if(this.state.error) { console.log(this.state.error); return(<div className="alert alert-danger" role="alert" style={{marginTop: 15}}>
      <b>Error {this.state.error.statusCode}!</b> {this.state.error.reason}. {this.state.error.json}
    </div>) }

    if(!this.state.container) {return(<h1>Loading...</h1>)}

    let ContainerStateLabel = null;
    if(this.state.container.State.Paused) { ContainerStateLabel = <small>paused</small>}
    else if(this.state.container.State.Running) { ContainerStateLabel = <small style={{color:"green"}}>running</small>}
    else { ContainerStateLabel = <small>stopped</small> }

    return (<div>
      <h2>
        <button type="button" className="btn btn-link" onClick={this.refresh}><span className="glyphicon glyphicon-refresh"></span></button>
        &nbsp;{this.state.displayName}
        &nbsp;{ContainerStateLabel}
      </h2>

      <div className="row">
        {this.get_controls_col()}
        {this.get_tabs_col()}
      </div>
      <hr />

      {this.get_tab_component()}

    </div>);
  },

  get_tab_component() {
    if(this.state.tab == "about") {return <About container={this.state.container} />}
    else {return <Logs container_name={this.state.name} />}
  },

  get_controls_col() {

    let first_button = null;
    if(this.state.container.State.Running) {
      first_button = <button type="button" className="btn btn-default" onClick={this.containerStop}><span className="glyphicon glyphicon-stop"></span> Stop</button>
    } else {
      first_button = <button type="button" className="btn btn-default" onClick={this.containerStart}><span className="glyphicon glyphicon-play"></span> Start</button>
    }

    return (<div className="col-md-8">
      {first_button}
      &nbsp;<button type="button" className="btn btn-default" onClick={this.containerReStart}><span className="glyphicon glyphicon-repeat"></span> Restart</button>
    </div>)
  },

  get_tabs_col() {

    let AboutCls = ClassNames({
      btn: true,
      "btn-primary": this.state.tab == "about",
      "btn-link": this.state.tab != "about"
    });

    let LogsCls = ClassNames({
      btn: true,
      "btn-primary": this.state.tab == "logs",
      "btn-link": this.state.tab != "logs"
    });

    return (<div className="col-md-4">
      <button type="button" className={AboutCls} onClick={this.tab_about}>About</button>
      <button type="button" className={LogsCls} onClick={this.tab_logs}>Logs</button>
    </div>)
  },

  tab_about() {
    this.setState({"tab": "about"});
  },

  tab_logs() {
    this.setState({"tab": "logs"});
  }


});
