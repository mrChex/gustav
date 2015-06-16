Docker = require('dockerode')
config=require('./config/config')

exports.docker = new Docker(config.docker)
