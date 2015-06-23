# Version: 0.2.0
FROM ubuntu:14.04
MAINTAINER UkrainianSolutions <chex@soul.li>

ENV DEBIAN_FRONTEND noninteractive

# Installing base requirements
RUN apt-get update && apt-get install -y \
                       curl \
                       python-virtualenv python3-dev libmysqlclient-dev \
                       ssh git

RUN curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
RUN apt-get install -y nodejs

RUN npm install -g coffee-script
ENV NODE_PATH /usr/local/lib/node_modules

RUN npm install -g babel babel-core babel-loader bootstrap-sass bootstrap-sass-loader \
                   bower-webpack-plugin \
                  classnames \
                  css-loader \
                  dockerode \
                  express \
                  extract-text-webpack-plugin \
                  file-loader \
                  jquery \
                  jsx-loader \
                  ncp \
                  react \
                  react-router \
                  socket.io \
                  socket.io-client \
                  style \
                  tar-fs \
                  url \
                  url-loader \
                  webpack \
                  webpack-dev-middleware \
                  webpack-dev-server

RUN npm install -g nodemon

RUN useradd -ms /bin/bash gustav

RUN locale-gen "en_US.UTF-8"
RUN locale-gen "ru_RU.UTF-8"
RUN dpkg-reconfigure locales
RUN echo "export LC_ALL=en_US.utf8" >> /home/gustav/.bashrc
RUN echo "export LANG=en_US.utf8" >> /home/gustav/.bashrc

COPY ./src /home/gustav/src
WORKDIR /home/gustav/src
RUN ln -s /usr/lib/node_modules node_modules
RUN npm run build

ADD entrypoint /entrypoint
RUN chmod +x /entrypoint

VOLUME ["/home/gustav/projects"]
ENTRYPOINT ["/entrypoint"]
CMD ["run", "run-dev", "bash"]

ONBUILD RUN mkdir /home/gustav/.ssh
ONBUILD COPY keys/id_rsa /home/gustav/.ssh/id_rsa
ONBUILD RUN ssh-keyscan -H github.com >> /home/gustav/.ssh/known_hosts

ONBUILD ADD config /home/gustav/src/config

ONBUILD RUN chown -R 1000:1000 /home/gustav

ONBUILD USER 1000
ONBUILD ENV HOME /home/gustav
