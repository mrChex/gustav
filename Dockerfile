# Version: 0.0.1
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

RUN locale-gen "en_US.UTF-8"
RUN locale-gen "ru_RU.UTF-8"
RUN dpkg-reconfigure locales
RUN echo "export LC_ALL=en_US.utf8" >> /root/.bashrc
RUN echo "export LANG=en_US.utf8" >> /root/.bashrc

ADD src /root/gustav
WORKDIR /root/gustav
RUN ln -s /usr/lib/node_modules node_modules
RUN npm run build

RUN echo "YO"
ADD entrypoint /entrypoint
RUN chmod +x /entrypoint

ENTRYPOINT ["/entrypoint"]
CMD ["run", "bash"]
