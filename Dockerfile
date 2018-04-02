FROM node:8.9.0-alpine

COPY . /code
WORKDIR /code

RUN rm -rf node_modules && \
    npm install --only=production

ENTRYPOINT [ "npm" ]
CMD [ "start" ] 