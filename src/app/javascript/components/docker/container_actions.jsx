import React from 'react';
import classNames from 'classnames';


export default React.createClass({

  getInitialState() {

    let {container} = this.props;
    let running = container.Status.startsWith("Up");
    let paused = container.Status.endsWith("(Paused)");

    return {"open": false,
            "running": running,
            "paused": paused}
  },

  dropdownToggle() {
    this.setState({"open": !this.state.open});
  },

  containerPause() { this.props.pause(); },
  containerUnpause() { this.props.unpause(); },
  containerStop() { this.props.stop(); },
  containerStart() { this.props.start(); },
  containerReStart() { this.props.restart(); },
  containerRemove() { this.props.remove(); },

  render() {

    let {container} = this.props;

    let dropdownCls = classNames({
      dropdown: true,
      open: this.state.open
    });

    let btnCls = classNames({
      btn: true,
      "btn-default": !this.state.running&!this.state.paused,
      "btn-success": this.state.running&!this.state.paused,
      "btn-info": this.state.paused,
      "btn-xs": true,
      "dropdown-toggle": true
    });

    let btnLabel = "Not running";
    if(this.state.paused) { btnLabel = "Paused"; }
    else if(this.state.running) { btnLabel = "Running"; }

    let showIfRunningCls = classNames({
      hidden: !(this.state.running&!this.state.paused)
    });

    let showIfPausedCls = classNames({
      hidden: !this.state.paused
    });

    let showIfNotRunningCls = classNames({
      hidden: !(!this.state.running&!this.state.paused)
    });

    let showIfRunningOrPausedCls = classNames({
      hidden: !this.state.running
    });

    let delimetrCls = classNames({
      "dropdown-header": true,
      hidden: !(!this.state.running&!this.state.paused)
    });

    return(
      <div className={dropdownCls}>
        <button className={btnCls} type="button" onClick={this.dropdownToggle}>
          {btnLabel}
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu" role="menu">

          <li role="presentation" className={showIfRunningCls}>
            <a role="menuitem" tabIndex="-1" onClick={this.containerPause}>
              <span className="glyphicon glyphicon-pause"></span> Pause
            </a>
          </li>

          <li role="presentation" className={showIfPausedCls}>
            <a role="menuitem" tabIndex="-1" onClick={this.containerUnpause}>
              <span className="glyphicon glyphicon-play"></span> Unpause
            </a>
          </li>

          <li role="presentation" className={showIfRunningCls}>
            <a role="menuitem" tabIndex="-1" onClick={this.containerReStart}>
              <span className="glyphicon glyphicon-refresh"></span> Restart
            </a>
          </li>

          <li role="presentation" className={showIfRunningCls}>
            <a role="menuitem" tabIndex="-1" onClick={this.containerStop}>
              <span className="glyphicon glyphicon-stop"></span> Stop
            </a>
          </li>

          <li role="presentation" className={showIfNotRunningCls}>
            <a role="menuitem" tabIndex="-1" onClick={this.containerStart}>
              <span className="glyphicon glyphicon-fire"></span> Start
            </a>
          </li>

          <li role="presentation" className={delimetrCls}>------</li>

          <li role="presentation" className={showIfNotRunningCls}>
            <a role="menuitem" tabIndex="-1" onClick={this.containerRemove}>
              <span className="glyphicon glyphicon-trash"></span> Delete
            </a>
          </li>

        </ul>
      </div>
    );

  }
});
