docker = require('./docker').docker


streams = []

docker_stats = -> docker.listContainers (err, containers)->
  containers.map (container_info)->
    container = docker.getContainer(container_info['Id'])
    container.stats (err, data)->

      data.on 'data', (l)->
        console.log container_info['Names'][0], err, l.toString('utf8')

      data.on 'end', -> console.log container_info['Names'][0], 'END'

      streams.push data


exports.start = ->
  docker_stats()

exports.stop = ->
  abort_last_stream_recursively = ->
    stream = streams.pop()
    if not stream then return true
    stream.req.abort()
    return abort_last_stream_recursively()

  return abort_last_stream_recursively()

exports.restart = ->
  exports.stop()
  exports.start()
