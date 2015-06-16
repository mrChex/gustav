import React from 'react';


export default React.createClass({

  getInitialState() {
    return {"container": this.props.container}
  },

  render() {
    let {container} = this.state;


    return(<table className="table">

      <tr>
        <th>Ports</th>
        <td>{this.get_ports()}</td>
      </tr>

      <tr>
        <th>Volumes</th>
        <td>{Object.keys(container.Volumes).map((volume)=>{return(
          <div key={volume}>
            {container.Volumes[volume]} => {volume}
          </div>
        )})}</td>
      </tr>

      <tr>
        <th>Working dir</th>
        <td>{container.Config.WorkingDir}</td>
      </tr>

      <tr>
        <th>ENVs</th>
        <td>
          {container.Config.Env.map((env) => {return (
            <div key={env}>{env}</div>
          )})}
        </td>
      </tr>
    </table>)
  },

  get_ports() {
    let {container} = this.state;
    if(!container.NetworkSettings.Ports) return null;
    return Object.keys(container.NetworkSettings.Ports).map((port, mapped)=>{
      let mapped_ports = "Not mapped";
      if(container.NetworkSettings.Ports[port]) {
        mapped_ports = container.NetworkSettings.Ports[port].map((mapped) => {return(
          <span key={mapped}>{mapped.HostPort}&nbsp;</span>
        )})
      }

      return(
      <div key={port}>{port} =>&nbsp;
        {mapped_ports}
      </div>
    )})
  }

});
