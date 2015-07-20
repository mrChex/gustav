import {console as config_console} from './config';


let socket = io.connect();

let listenners = {};
let history = {};

let observer = {

  listen(project, branch, task, callback) {
    if(!listenners[project]) {
      listenners[project] = [];
    }

    listenners[project].push({
      callback: callback,
      branch: branch,
      task: task
    });

    console.log('listenners', listenners);

  },

  unlisten(project, branch, task, callback) {
    let new_listenners = [];

    for(let listener of listenners[project]) {

      if(listener['callback'] == callback &&
         listener['branch'] == branch &&
         listener['task'] == task) {

        console.log('unlisten', listener);

      } else {
        new_listenners.push(listener);
      }

    }

    listenners = new_listenners;

  },

  get_history(project, branch, task) {
    let history_key = `${project}-${branch}-${task}`;
    if(!history[history_key]) { return false; }
    return history[history_key];
  }

};

socket.on('docker-out-stacked', (stacked) => {

  let callbacks = {};

  for(let [project, _branch, _task, data] of stacked) {

    let history_key = `${project}.${_branch}.${_task}`;
    console.log('docker-out', history_key);
    if(!history[history_key]) { history[history_key] = []; }

    history[history_key].push(data);
    if(history[history_key].length > config_console.history_max_lines_per_task) {
      history[history_key].shift();
    }

    if(!listenners[project] || listenners[project].length == 0) { return; }

    for(let {branch, task, callback} of listenners[project]) {
      if(branch == _branch && task == _task) {
        if(!callbacks[_branch+_task]) {
          callbacks[_branch+_task] = {"callback": callback,
                                      "data": [data]}
        } else {
          callbacks[_branch+_task]['data'].push(data);
        }
      }
    }

  }

  for(let key in callbacks) {
    let {callback, data} = callbacks[key];
    callback(data);
  }

});

socket.on('error', (err) => {
  console.log('error handling?');
});


export { socket, observer };
