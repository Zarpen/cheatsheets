FROM node:latest
WORKDIR /app
ENV PORT=4112
COPY . .
RUN npm install
EXPOSE $PORT
ENTRYPOINT ["node", "index"]