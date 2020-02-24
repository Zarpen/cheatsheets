const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 5876;

app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));

const kfwScript = `${process.env.SCRIPT_ID}`;
const kfwSessionId= `${process.env.SESSION_ID}`;
const kfwHost = `${process.env.PREVIEW_HOST}`;
const kfwHttps = `${process.env.HTTPS}`;

app.get('/hello', function(req,res){
  fetch('https://00000000000000000000000000000000.cloudflareworkers.com', { headers: {"Cookie" : ("__ew_fiddle_preview=" + kfwScript + kfwSessionId + kfwHttps + kfwHost) } })
    .then(subres => subres.json()) // expecting a json response
    .then(json => res.status(200).send(json))
    .catch(error => res.status(400).send(error));
});

app.get('/environment', function(req,res){
  res.status(200).send(JSON.stringify({
    kfwScript: kfwScript,
    kfwSessionId: kfwSessionId,
    kfwHost: kfwHost,
    kfwHttps: kfwHttps
  }));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));