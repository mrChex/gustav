fs = require 'fs'
exec = require('child_process').exec
execSync = require('child_process').execSync

express = require('express')
app = express()
server = require('http').Server(app)
io = require('socket.io')(server)

webpackMiddleware = require("webpack-dev-middleware")
webpack = require 'webpack'

docker = require('./docker').docker
config = require('./config/config')
build = require('./build').build

app.get '/', (req, res)->
  res.sendfile(__dirname + '/index.html')

if config.use_webpack_middleware
  app.use webpackMiddleware webpack(require('./webpack.config')),
      publicPath: "/app/build/"
      stats: colors: true
else
  app.use('/app/build', express.static('app/build'))



OPENED_LOGS_STREAMS = {}

io.on 'connection', (socket)->
  socket.emit('news', { hello: 'world' })
  socket.on 'my other event', (data)->
    console.log(data)

  socket.on 'projects', (fn)->
    projects = config.projects.slice().map (project)->
      if project.hidden then return project

      branches = []
      if not fs.existsSync("projects/#{project['name']}")
        fs.mkdirSync("projects/#{project['name']}")

      for branch_name in fs.readdirSync("./projects/#{project['name']}")
        if branch_name == "defaults" then continue
        branch = {name: branch_name}
        branch_inside = fs.readdirSync("./projects/#{project['name']}/#{branch_name}")
        if 'docker_image_id' in branch_inside
          branch['docker_image_id'] = fs.readFileSync("./projects/#{project['name']}/#{branch_name}/docker_image_id").toString()
        else
          branch['docker_image_id'] = null
        branches.push branch

      project['branches'] = branches
      return project

    return fn null, projects

  socket.on 'project', (project, fn)->
    project_config = config.get_project(project)

    fn project_config

  socket.on 'images', (opts, fn)->
    console.log("IMAGES OPTS", opts)
    docker.listImages opts, (err, data)->
      fn err, data

  socket.on 'containers', (opts, fn)->
    docker.listContainers opts, (err, data)->
      fn err, data

  socket.on 'container inspect', (name, fn)->
    container = docker.getContainer(name)
    container.inspect (err, data)->
      fn err, data

  socket.on 'container logs', (name, fn)->
    console.log 'CONTAINER LOGS'
    container = docker.getContainer(name)
    console.log 'container', name, container, OPENED_LOGS_STREAMS

    opts =
      stdout: yes
      stderr: yes
      timestamps: no
      tail: 100

    if OPENED_LOGS_STREAMS[name]
      opts['follow'] = no
    else
      opts['follow'] = yes
      OPENED_LOGS_STREAMS[name] = true

    name_n = name.split('.')
    container.logs opts, (err, data)=>
      fn err
      if err then return console.log 'ERROR', err

      data.on 'data', (l)=>
        io.sockets.emit('docker-out', name_n[0], name_n[1], name_n[2], l.toString('utf8'))

      data.on 'end', =>
        io.sockets.emit('docker-out', name_n[0], name_n[1], name_n[2], {"stream-end": true})
        OPENED_LOGS_STREAMS[name] = false


  socket.on 'container create', (opts, fn)->
    docker.createContainer opts, (err, container)->
      console.log('CREATE', err, container);
      if err then return fn err, null
      fn err, container.Id

  socket.on 'container pause', (name, opts, fn)->
    docker.getContainer(name).pause opts, (err, data)->
      console.log('PAUSE', err, data);
      fn err, data

  socket.on 'container unpause', (name, opts, fn)->
    docker.getContainer(name).unpause opts, (err, data)->
      console.log('UNPAUSE', err, data);
      fn err, data

  socket.on 'container restart', (name, opts, fn)->
    docker.getContainer(name).restart opts, (err, data)->
      console.log('RESTART', err, data);
      fn err, data

  socket.on 'container stop', (name, opts, fn)->
    docker.getContainer(name).stop opts, (err, data)->
      console.log('STOP', err, data);
      fn err, data

  socket.on 'container start', (name, opts, fn)->
    docker.getContainer(name).start opts, (err, data)->
      console.log('START', err, data);
      fn err, data

  socket.on 'container remove', (name, opts, fn)->
    docker.getContainer(name).remove opts, (err, data)->
      console.log('REMOVE', err, data);
      fn err, data


  socket.on 'build', (project_name)->
    build project_name, true, (l)->
      console.log(l)
      socket.emit('build-log', project_name, l)

  socket.on 'delete image', (name, fn)->
    image = docker.getImage(name)
    image.remove (err, status)->
      console.log 'remove', err, status
      fn err, status

  socket.on 'create branch', (data, fn)->
    steps_results = {}
    project_dir = "projects/#{data['project']}/#{data['branch']}"
    PROJECT = data['project']
    BRANCH = data['branch']


    create_containers = (docker_image_id)=>
      project_config = config.get_project(data['project'])

      create_container_recursivly = (containers, fn)=>
        container = containers.pop()
        if not container then return fn()

        container['Image'] = docker_image_id
        container['name'] = "#{data['project']}.#{data['branch']}.#{container['name']}"

        if container['Binds']
          __cwd = process.cwd() + '/' + project_dir
          container['Binds'] = container['Binds'].map (bind)-> __cwd + '/' + bind

        console.log ' * creating_container'
        docker.createContainer container, (err, _container)=>
          console.log "* SOME!", err, _container
          io.sockets.emit 'docker-out', data['project'], data['branch'], '_build', {"stream": "* Created container #{container.name}"}
          create_container_recursivly containers, fn

      create_container_recursivly project_config['containers'].slice(), =>
        io.sockets.emit 'docker-out', PROJECT, BRANCH, '_build', {"stream-end": true}

    continue_creating = =>
      # creating branch folder
      io.sockets.emit 'docker-out', PROJECT, BRANCH, '_build', {"stream": "* Creating folders & clone"}
      if not fs.existsSync("projects/#{data['project']}")
        fs.mkdirSync("projects/#{data['project']}")
      fs.mkdirSync(project_dir)
      fs.mkdirSync("#{project_dir}/docker-out")

      project_git = null
      for project in config.projects.slice()
        if project.name == data['project']
          project_git = project['git']
          break

      if not project_git
        return fn "project not found", data

      # clonecmd = "ssh-agent bash -c 'ssh-add keys/id_rsa; " +
      clonecmd = "" +
                 "git clone #{project_git} #{project_dir}/source " +
                      "--branch #{data['branch']}"

      console.log 'CLONE CMD: ', clonecmd


      child = exec clonecmd
      stdout = stderr = ""

      child.stdout.on 'data', (data)->
        console.log 'stdout: ', data
        io.sockets.emit 'docker-out', PROJECT, BRANCH, '_build', {"stream": "GIT: #{data}"}
        stdout += data

      child.stderr.on 'data', (data)->
        console.log 'stderr: ', data
        io.sockets.emit 'docker-out', PROJECT, BRANCH, '_build', {"stream": "GETERR: #{data}"}
        stderr += data

      child.on 'close', (code)->
        res =
          stdout: stdout
          stderr: stderr
          code: code
          cmd: clonecmd

        if code > 0
          fs.rmdirSync(project_dir)
          return fn "Cant cloning repo", res

        steps_results['clone'] = res

        console.log 'STEP 2 - copy docker files'
        execSync("cp -R -v config/projects/#{data['project']}/* #{project_dir}")
        console.log 'Copied'
        fn null, steps_results  # CLONE DONE. Do docker build

        docker_name = "#{config.namespace}/#{data['project']}:#{data['branch']}"
        docker_out = "#{docker_name}\n\n"

        build data['project'], data['branch'], !config.build_use_cache, (out_parsed)->
          if out_parsed['stream']
            console.log('DOCKER', out_parsed['stream'].trim());
          else
            console.log('DOCKER', out_parsed);

          io.sockets.emit 'docker-out', data['project'], data['branch'], '_build', out_parsed
          fs.appendFileSync("#{project_dir}/docker-out/_build", out_parsed['stream'])

          startPattern = 'Successfully built '
          if out_parsed['stream'] and out_parsed['stream'].slice(0, startPattern.length) == startPattern
            docker_image = out_parsed['stream'].split("#{startPattern}")[1].trim()

            fs.writeFileSync("#{project_dir}/docker_image_id", docker_image)

            create_containers(docker_image)

    # FIXME! This must be in another method!!!
    if fs.existsSync(project_dir)
      if fs.existsSync("#{project_dir}/docker_image_id")
        docker_image_id = fs.readFileSync("#{project_dir}/docker_image_id").toString().trim()
        image = docker.getImage(docker_image_id)

        continue_creating_after_cleaning = =>
          image.remove {force: yes}, (err, status)=>
            console.log "IMAGE REMOVED!"
            execSync("rm -rf #{project_dir}")
            io.sockets.emit 'docker-out', PROJECT, BRANCH, '_build', {"stream": "* IMAGE REMOVED"}
            continue_creating()

        delete_container_if_equal = (containers, fn)=>
          container = containers.pop()
          if not container then return fn()

          if container.Image.indexOf(image.name) == 0
            docker.getContainer(container.Id).remove {force: yes}, (err)=>
              console.log('REMOVE CONTAINER!', err, container);
              io.sockets.emit 'docker-out', PROJECT, BRANCH, '_build', {"stream": "* CONTAINER REMOVED #{container.Names[0]}"}
              return delete_container_if_equal(containers, fn)
          else
            console.log("Pass container")
            return delete_container_if_equal(containers, fn)


        docker.listContainers {all:yes}, (err, data)=>
          if err then return console.log "Cant get containers", err, data
          else console.log "containers", data

          delete_container_if_equal data, continue_creating_after_cleaning


      else
        execSync("rm -rf #{project_dir}")
        continue_creating()

    else
      continue_creating()



server.listen 3000, ->
  host = server.address().address
  port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
