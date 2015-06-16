import React from 'react';
import {Link, RouteHandler} from 'react-router';
import socket from '../socket';

import ProjectsComponent from './projects';


export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  render() {

    return (

        <div className="row">
          <div className="col-md-4"><ProjectsComponent /></div>
          <div className="col-md-8"><RouteHandler /></div>
        </div>

    )
  }
});
