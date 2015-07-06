import React from 'react';
import classNames from 'classnames';
import {socket} from '../../socket';
import Actions from './container_actions';
import {Link, RouteHandler} from 'react-router';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return {"delete_confirmation": false,
            "delete_in_progress": false,
            "delete_success": false}
  },

  delete() {
    if(!this.state.delete_confirmation) {
      this.setState({"delete_confirmation": true})
    } else {
      this.setState({"delete_in_progress": true})
      this.props.delete_image(this.props.image.Id);
    }
  },

  containerPause() {
    this.props.setLoading();
    socket.emit('container pause', this.props.container.Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER PAUSE', err, data);
      this.props.reload();
    });
  },

  containerUnpause() {
    this.props.setLoading();
    socket.emit('container unpause', this.props.container.Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER UNPAUSE', err, data);
      this.props.reload();
    });
  },

  containerStop() {
    this.props.setLoading();
    socket.emit('container stop', this.props.container.Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER STOP', err, data);
      this.props.reload();
    });
  },

  containerStart() {
    this.props.setLoading();
    socket.emit('container start', this.props.container.Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER START', err, data);
      this.props.reload();
    });
  },

  containerReStart() {
    this.props.setLoading();
    socket.emit('container restart', this.props.container.Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER RESTART', err, data);
      this.props.reload();
    });
  },

  containerRemove() {
    this.props.setLoading();
    socket.emit('container remove', this.props.container.Id, {}, (err, data) => {
      if(err) {alert(err['json']);}
      console.log('CONTAINER REMOVE', err, data);
      this.props.reload();
    });
  },

  render() {

    let {container} = this.props;

    let Id = container.Id.slice(0,12);

    let Names = null;
    if(container.Names) {
      Names = container.Names.map((name)=>{
        return <div key={name}>{name}</div>
      });
    }

    return (<tr>

      <td>
        <Actions container={container}
                 pause={this.containerPause}
                 unpause={this.containerUnpause}
                 stop={this.containerStop}
                 start={this.containerStart}
                 restart={this.containerReStart}
                 remove={this.containerRemove} />
      </td>
      <td><Link to="docker-page-container-tab" params={{name: Id, tab:'about'}}>{Id}</Link></td>
      <td>{container.Image.slice(0,30)}</td>
      <td>{Names}</td>
      <td>{container.Status}</td>
      <td>{container.Command}</td>
      <td>{container.Ports.map((port)=>{
        let {PrivatePort, PublicPort, Type} = port;
        if(!PublicPort) { PublicPort = "NotMatched" }
        return <span key={PublicPort}>{PublicPort}=>{PrivatePort}/{Type} </span>
      })}</td>

    </tr>)

  }
});
