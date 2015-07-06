import React from 'react';
import Router, {Route, DefaultRoute, NotFoundRoute} from 'react-router';
import { socket } from './socket';


// Components
import AppComponent from './components/app';
import MainPage from './components/mainpage';
import Monitoring from './components/monitoring/index';
import DockerOut from './components/dockerOut';

import DockerPage from './components/docker/index';
import DockerImages from './components/docker/images';
import DockerContainers from './components/docker/containers'
import DockerContainer from './components/docker/container_detail'

import Project from './components/project/index';


let routes = (
  <Route name='root' path='/' handler={AppComponent}>
    <Route name='main-page' path='/' handler={MainPage}>

      <Route name='monitoring' path='/' handler={Monitoring} />

      <Route name='docker-out' path='/docker-out/:project/:branch/:task' handler={DockerOut} />

      <Route name='project'>
        <Route name='project-index' path='/project/:project/:branch' handler={Project} />
        <Route name='project-task' path='/project/:project/:branch/:task' handler={Project} />
        <Route name='project-task-tab' path='/project/:project/:branch/:task/:tab' handler={Project} />
      </Route>

    </Route>

    <Route name='docker-page' path='/docker' handler={DockerPage}>

      <Route name="docker-page-images" path='/docker/images'>
        <Route name="docker-page-images-list" path='/docker/images' handler={DockerImages}/>
        <Route name="docker-page-images-list-all" path='/docker/images/:all' handler={DockerImages}/>
      </Route>

      <Route name="docker-page-containers" path='/docker/containers'>
        <Route name='docker-page-containers-list' path='/docker/containers' handler={DockerContainers} />
        <Route name="docker-page-containers-list-all" path='/docker/containers/:all' handler={DockerContainers} />
        <Route name="docker-page-container" path='/docker/container/:name' handler={DockerContainer} />
        <Route name="docker-page-container-tab" path='/docker/container/:name/:tab' handler={DockerContainer} />
      </Route>
    </Route>

  </Route>
);

let router_initialized = false;

socket.on('connect', () => { if(!router_initialized) {

  console.log('Socket connection');
  router_initialized = true;

  Router.run(routes, (Handler) => {
    React.render(<Handler/>, document.getElementById('react-root'));
  });

}});
