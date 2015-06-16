import React from 'react';
import {Link, RouteHandler} from 'react-router';
import classNames from 'classnames';


export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  render() {
    let router = this.context.router;

    let mainPageCls = classNames({
      active: router.isActive('main-page')
    });

    let dockerPageCls = classNames({
      active: router.isActive('docker-page')
    });

    let containerCls = classNames({
      "container-fluid": true,
      // "container": router.isActive('docker-page')
    })


    return (
      <div>

        <nav className="navbar navbar-default navbar-static-top">
          <div className="container">

            <div className="navbar-header">
              <a className="navbar-brand" href="#">Gustav ♥ CI</a>
            </div>

            <div id="navbar" className="navbar-collapse collapse">
              <ul className="nav navbar-nav">
                <li className={mainPageCls}>
                  <Link to='main-page'>Projects</Link>
                </li>

                <li className={dockerPageCls}>
                  <Link to='docker-page-containers-list'>Docker</Link>
                </li>

              </ul>
            </div>

          </div>
        </nav>

        <div className={containerCls}>
          <RouteHandler />
        </div>

      </div>
    )
  }
});
