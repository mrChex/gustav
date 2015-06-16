import React from 'react';
import classNames from 'classnames';
import {Link, RouteHandler} from 'react-router';
import { socket } from '../../socket';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  render() {

    return (<div className="row">

      <div className="col-md-3 col-lg-2">
        <div className="list-group">
          <Link to='docker-page-images' className="list-group-item">Images</Link>
          <Link to='docker-page-containers' className="list-group-item">Containers</Link>
        </div>
      </div>

      <div className="col-md-9 col-lg-10">
        <RouteHandler />
      </div>

    </div>)

  }
});
