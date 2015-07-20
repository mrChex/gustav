Docker = require('dockerode')
config=require('./config/config')

exports.docker = new Docker(config.docker)

out_cache = []
out_interval = no

exports.init = (io)->
  out_interval = setInterval =>
    if out_cache.length > 0
      to_send = out_cache
      out_cache = []
      io.sockets.emit 'docker-out-stacked', to_send
  , 1000

exports.out = (project, branch, task, line)->
  out_cache.push [project, branch, task, line]
