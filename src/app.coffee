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
Docker_out = require('./docker').out
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


stats = require('./stats')
stats.set_io io

require('./docker').init(io)

get_containers_for_branch = (project_name, branch_name, fn)->
  console.log "GET '#{project_name}', '#{branch_name}'"
  image = docker.getImage "#{config['namespace']}/#{project_name}:#{branch_name}"
  image.inspect (err, inspect)->
    if err
      console.log('image getted', err)
      return fn({error: err}, null)

    branch_containers = config.get_project(project_name)['containers'].map (task)->
      return "#{project_name}.#{branch_name}.#{task['name']}"

    _containers = []
    add_container = ->
      container = branch_containers.shift()
      if not container then return fn(inspect, _containers)

      console.log('add container', container)
      docker.getContainer(container).inspect (err, inspect)->
        if err
          _containers.push {error: err, task:container}
        else
          _containers.push {inspect: inspect, task: container}
        add_container()
    add_container()

delete_branch = (project_name, branch_name, fn, is_remove_files=yes)->
  report = [['report', project_name, branch_name]]
  get_containers_for_branch project_name, branch_name, (image, containers)->
    project_dir = "projects/#{project_name}/#{branch_name}"

    remove_container = ->
      container = containers.pop()
      if not container then return remove_image()
      if container['error']
        report.push ['container', container['task'], 'ignored', container['error']]
        return remove_container()

      _container = docker.getContainer container['inspect']['Id']
      _container.remove {force: true}, (err, data)->
        if err
          report.push ['container', container['task'], 'error', err]
        else
          report.push ['container', container['task'], 'removed', data]

        remove_container()

    remove_image = ->
      _image = docker.getImage image['Id']
      _image.remove {force: true}, (err, data)->
        if err
          report.push ['image', image['Id'], 'error', err]
        else
          report.push ['image', image['Id'], 'removed', data]

        if is_remove_files
          return remove_files()
        else
          return fn(report)

    remove_files = ->
      if fs.existsSync(project_dir)
        execSync("rm -rf #{project_dir}")
        report.push ['files', 'removed']
      else
        report.push ['files', 'not found']

      fn(report)

    if image['error']
      report.push ['error', 'Image not found']
      if is_remove_files
        return remove_files()
      else
        return fn(report)

    return remove_container()


create_containers = (docker_image_id, project_name, branch_name, LINKS)->
  project_dir = "projects/#{project_name}/#{branch_name}"
  project_config = config.get_project(project_name)

  console.log ' * create containers', project_config
  create_container_recursivly = (containers, fn)=>
    container = containers.pop()
    console.log 'CREATE CONTAINER RECURS', docker_image_id, project_name, branch_name, LINKS, containers, container
    if not container
      return fn()

    container['Image'] = docker_image_id
    container['name'] = "#{project_name}.#{branch_name}.#{container['name']}"

    if container['Binds']
      __cwd = config.cwd + '/' + project_dir
      container['Binds'] = container['Binds'].map (bind)-> __cwd + '/' + bind

    console.log 'to links'
    if container['Links']
      console.log 'links'
      container['Links'] = container['Links'].map (link) =>
        if LINKS[link] then link_branch = LINKS[link]
        else link_branch = "master"
        return link.replace("@", ".#{link_branch}.")

    console.log ' * creating_container'
    console.log 'container', container
    docker.createContainer container, (err, _container)=>
      console.log "* SOME!", err, _container
      if not err
        Docker_out project_name, branch_name, '_build', {"stream": "* Created container #{container.name}"}
      else
        Docker_out project_name, branch_name, '_build', {"error": "* Error creating container #{container.name}. Msg: #{err['json']}"}

      create_container_recursivly containers, fn

  create_container_recursivly project_config['containers'].slice(), =>
    Docker_out project_name, branch_name, '_build', {"stream-end": true}



rebuild_branch = (project_name, branch_name, LINKS)->
  project_dir = "projects/#{project_name}/#{branch_name}"

  after_delete_fn = (report)->
    for item in report
      Docker_out project_name, branch_name, '_build', {"stream": "#{item}"}


    # Next COPY PASTE!!! :( sadly truth


    build project_name, branch_name, !config.build_use_cache, (out_parsed)->
      if out_parsed['stream']
        console.log('DOCKER', out_parsed['stream'].trim());
      else
        console.log('DOCKER', out_parsed);

      Docker_out project_name, branch_name, '_build', out_parsed
      fs.appendFileSync("#{project_dir}/docker-out/_build", out_parsed['stream'])

      startPattern = 'Successfully built '
      if out_parsed['stream'] and out_parsed['stream'].slice(0, startPattern.length) == startPattern
        docker_image = out_parsed['stream'].split("#{startPattern}")[1].trim()

        fs.writeFileSync("#{project_dir}/docker_image_id", docker_image)

        create_containers(docker_image, project_name, branch_name, LINKS)



  delete_branch(project_name, branch_name, after_delete_fn, no)


io.on 'connection', (socket)->

  socket.on 'projects', (fn)->
    if not fs.existsSync("projects")
      return fn "ProjectsVolumeNotMounted", null

    tasks = {}
    projects = config.projects.slice().map (project)->
      if project.hidden then return project

      tasks[project['name']] = project.containers.map (container)->
        return container.name

      branches = []
      if not fs.existsSync("projects/#{project['name']}")
        fs.mkdirSync("projects/#{project['name']}")

      for branch_name in fs.readdirSync("./projects/#{project['name']}")
        if branch_name == "defaults" or branch_name[0] == "."
          continue
        branch = {name: branch_name}

        branches.push branch

      project['branches'] = branches
      return project

    do_response =->
      return fn null, projects


    add_docker_info_project = (i)->
      console.log('add docker', i)
      continue_project =-> add_docker_info_project(i+1)

      project = projects[i]
      if not project then return do_response()

      branches = project['branches']
      add_to_branch = (bi)->
        console.log("add branch", bi)
        continue_branch =-> add_to_branch(bi+1)
        branch = branches[bi]
        if not branch then return continue_project()

        get_containers_for_branch project['name'], branch['name'], (inspect, containers)->
          branch['image'] = inspect
          branch['containers'] = containers
          add_to_branch(bi+1)

      add_to_branch(0)

    add_docker_info_project(0)


  socket.on 'stats is_started', (fn)-> return fn stats.is_started fn
  socket.on 'stats start', (fn)-> stats.start fn
  socket.on 'stats stop', -> stats.stop()
  socket.on 'stats subscribe', -> socket.join 'stats'
  socket.on 'stats unsubscribe', -> socket.leave 'stats'


  socket.on 'get git heads', (project_name, fn)->
    project = config.get_project project_name

    cmd = "git ls-remote --heads #{project['git']}"
    console.log cmd
    child = exec cmd
    stdout = stderr = ""

    child.stdout.on 'data', (data)->
      stdout += data

    child.stderr.on 'data', (data)->
      stderr += data

    child.on 'close', (code)->
      return fn(code, stdout, stderr)



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

  socket.on 'delete branch', (project_name, branch_name, fn)->
    delete_branch project_name, branch_name, (report)->
      console.log 'report', report
      return fn report

  socket.on 'rebuild branch', (project_name, branch_name, links, fn)->
    rebuild_branch project_name, branch_name, links

  socket.on 'create branch', (data, fn)->
    steps_results = {}
    project_dir = "projects/#{data['project']}/#{data['branch']}"
    PROJECT = data['project']
    BRANCH = data['branch']
    LINKS = data['links']
    console.log("LINKS", LINKS)


    create_containers = (docker_image_id)=>
      project_config = config.get_project(data['project'])

      create_container_recursivly = (containers, fn)=>
        container = containers.pop()
        if not container then return fn()

        container['Image'] = docker_image_id
        container['name'] = "#{data['project']}.#{data['branch']}.#{container['name']}"

        if container['Binds']
          __cwd = config.cwd + '/' + project_dir
          container['Binds'] = container['Binds'].map (bind)-> __cwd + '/' + bind

        if container['Links']
          container['Links'] = container['Links'].map (link) =>
            if LINKS[link] then link_branch = LINKS[link]
            else link_branch = "master"
            return link.replace("@", ".#{link_branch}.")


        console.log ' * creating_container'
        docker.createContainer container, (err, _container)=>
          console.log "* SOME!", err, _container
          if not err
            Docker_out PROJECT, BRANCH, '_build', {"stream": "* Created container #{container.name}"}
          else
            Docker_out PROJECT, BRANCH, '_build', {"error": "* Error creating container #{container.name}. Msg: #{err['json']}"}


          create_container_recursivly containers, fn

      create_container_recursivly project_config['containers'].slice(), =>
        Docker_out PROJECT, BRANCH, '_build', {"stream-end": true}

    continue_creating = =>
      # creating branch folder
      Docker_out PROJECT, BRANCH, '_build', {"stream": "* Creating folders & clone"}
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
        Docker_out PROJECT, BRANCH, '_build', {"stream": "GIT: #{data}"}
        stdout += data

      child.stderr.on 'data', (data)->
        console.log 'stderr: ', data
        Docker_out PROJECT, BRANCH, '_build', {"stream": "GETERR: #{data}"}
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

          Docker_out data['project'], data['branch'], '_build', out_parsed
          fs.appendFileSync("#{project_dir}/docker-out/_build", out_parsed['stream'])

          startPattern = 'Successfully built '
          if out_parsed['stream'] and out_parsed['stream'].slice(0, startPattern.length) == startPattern
            docker_image = out_parsed['stream'].split("#{startPattern}")[1].trim()

            fs.writeFileSync("#{project_dir}/docker_image_id", docker_image)

            create_containers(docker_image)

    # FIXME! This must be in another method!!!
    if fs.existsSync(project_dir)
      return fn {"error": "project exist", "project_dir": project_dir}
    else
      continue_creating()


server.listen 3000, ->
  host = server.address().address
  port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
