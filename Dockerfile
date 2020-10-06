FROM node:8.9.0-alpine

COPY . /code
WORKDIR /code

RUN npm install --only=production && \
    npm install apollo-engine-binary-linux

ENTRYPOINT [ "npm" ]
CMD [ "start" ] 