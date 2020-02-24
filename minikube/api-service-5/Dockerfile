FROM node:latest
WORKDIR /app
ENV PORT=3000
COPY . .
RUN npm install @dollarshaveclub/cloudworker
EXPOSE $PORT
ENTRYPOINT ["/app/node_modules/@dollarshaveclub/cloudworker/bin/cloudworker.js","--kv-file","KeyValueStore=kv.json","/app/worker.js"]