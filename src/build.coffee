docker = require('./docker').docker
tar = require('tar-fs')
fs = require('fs')
config = require('./config/config')

exports.build = (project, branch, nocache, fn)->
  project_dir = "./projects/#{project}/#{branch}"
  # fs.writeFileSync("./cache-buster", "somesheet")
  tarStream = tar.pack project_dir,
    entries: ['.']


  docker.buildImage tarStream, {
    t: "#{config.namespace}/#{project}:#{branch}",
    nocache: nocache
  }, (error, output)->
    # fs.unlinkSync("./cache-buster")
    if error
      console.log error
    else
      output.on 'data', (l)->
        try
          fn JSON.parse l.toString('utf8')
        catch e
          fn {"stream": l.toString('utf8')}



