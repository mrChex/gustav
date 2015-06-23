docker = require('./docker').docker

io = no

streams = []
started = no
started_for = no


docker_stats = (fn)->
  if started then return false
  started = yes
  docker.listContainers (err, containers)->

    started_for = containers.map (container_info)->
      console.log container_info
      return container_info

    fn started_for

    containers.map (container_info)->
      container = docker.getContainer(container_info['Id'])
      container.stats (err, data)->
        buf = ""
        data.on 'data', (l)->
          buf = buf + l.toString('utf8')
          buf_splitted = buf.split("\n")
          if buf_splitted.length == 2
            [_json, buf] = buf_splitted
            console.log container_info['Names'][0], err, _json
            io.to('stats').emit("stats received #{container_info['Names'][0]}", err, JSON.parse _json)


        data.on 'end', ->
          console.log container_info['Names'][0], 'END'
          io.to('stats').emit("stats end #{container_info['Names'][0]}")

        streams.push data


exports.start = (fn)->
  if not started
    docker_stats (containers)->
      fn {"streams": containers.length, "for": containers}
  else
    fn no


exports.stop = ->
  if started
    started = false

    abort_last_stream_recursively = ->
      stream = streams.pop()
      if not stream then return true
      stream.req.abort()
      return abort_last_stream_recursively()

    return abort_last_stream_recursively()


exports.restart = (fn)->
  exports.stop()
  exports.start(fn)


exports.is_started = ->
  if not started then return no
  return {"streams": streams.length, "for": started_for}


exports.set_io = (_io)-> io = _io
