FROM node:latest
WORKDIR /app
ENV PORT=5876
COPY . .
RUN npm install
RUN apt install curl && apt install wget && apt install ./xxd.deb
RUN wget -O jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 && chmod +x ./jq && mv jq /usr/bin
RUN export SCRIPT_ID=$(curl -sX POST https://cloudflareworkers.com/script -H "Content-Type: text/javascript" --data-binary @worker.js | jq -r .id) && echo SCRIPT_ID=$SCRIPT_ID >> .env 
RUN export SESSION_ID=$(head -c 16 /dev/urandom | xxd -p) && echo SESSION_ID=$SESSION_ID >> .env
RUN export PREVIEW_HOST=tutorial.cloudflareworkers.com && echo PREVIEW_HOST=$PREVIEW_HOST >> .env
RUN export HTTPS=1 && echo HTTPS=$HTTPS >> .env
EXPOSE $PORT
ENTRYPOINT ["node", "index"]