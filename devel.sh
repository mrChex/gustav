docker run -t -i --rm --name gustavd-devel -p 3000:3000 -v `pwd`/projects:/home/gustav/src/projects -v /Users/chex/.boot2docker/certs/boot2docker-vm:/boot2docker -v /Users/chex/ukrainian.solutions/gustav/src/app:/home/gustav/src/app  -v /Users/chex/ukrainian.solutions/gustav/src/app.coffee:/home/gustav/src/app.coffee -v /Users/chex/ukrainian.solutions/gustav/src/stats.coffee:/home/gustav/src/stats.coffee -v `pwd`/config:/home/gustav/src/config gustav


