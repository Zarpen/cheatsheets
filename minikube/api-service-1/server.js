const express = require('express');
const Request = require("request");
const session = require('express-session');
const bodyParser = require('body-parser');
// const fetch = require("node-fetch");
const fetchTimeout = require('fetch-timeout');
const fetch = require('node-fetch');
const { request } = require('graphql-request');
const responseTime = require('response-time');
const {promisify} = require('util');
// const axios = require('axios');
const redis = require('redis');
const { Pool } = require('pg');
require('dotenv').config();

const fusionAuthEndpoint = `${process.env.api1_fusionauth}`;
const fusionAuthClient = `${process.env.api1_fusionauth_client}`;
const fusionAuthSecret = `${process.env.api1_fusionauth_secret}`;
const serviceEndpoint = `${process.env.api1_service}`;
const graphqlEndpoint = `${process.env.api1_graphql}`;
const kwEndpoint = `${process.env.api1_kw}`;

const {FusionAuthClient} = require('@fusionauth/node-client');

const client = new FusionAuthClient(fusionAuthClient, fusionAuthEndpoint);

const redirectUrlFusionAuth = serviceEndpoint + "/oauth-redirect";

//--------- Initiate the Express app -----
const app = express();
const port = 3000;
// const HOST = '0.0.0.0';
// app.use(express.json());
// use response-time as a middleware
app.use(responseTime());
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));

// TEST AUTH BACKEND

app.get('/oauth-redirect', function (req, res, next) {
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                     fusionAuthClient,
                                     fusionAuthSecret,
                                     redirectUrlFusionAuth)
  .then((response) => {
    fetch(kwEndpoint, { headers: {"user_id" : fusionAuthClient, "user_token": response.successResponse.access_token, "user_end_session": "false" } })
    .then(subres => subres.json()) // expecting a json response
    .then(json => {
      if(json.token && json.token != "none"){
        res.redirect(302, '/');
      }else{
        res.redirect(302, '/login');
      }
    })
    .catch(error => res.status(400).send(error));
  });
});

app.post('/fusionauth-webhook',(req, res) => {
  const request = req.body;

  console.log("logout from fusionauth " + request.event.type);

  if (request.event.type === 'jwt.refresh-token.revoke') {
    fetch(kwEndpoint, { headers: {"user_id" : fusionAuthClient, "user_token": "none", "user_end_session": "true" } })
    .then(subres => subres.json()) // expecting a json response
    .then(json => {
      console.log("logout from fusionauth");
      res.status(200).send();
    })
    .catch(error => res.status(400).send(error));
  }
});

// TEST FRONTEND

app.get('/', function(req,res){
  // Search for token on cache
  fetch(kwEndpoint, { headers: {"user_id" : fusionAuthClient, "user_token": "none", "user_end_session": "false" } })
  .then(subres => subres.json()) // expecting a json response
  .then(json => {
    if(json.token && json.token != "none"){
      res.status(200).send(
          "<a href='/data'>View GraphQL data</a><a href='/logout'>Logout</a>"
      );
    }else{
      res.redirect(302, '/login');
    }
  })
  .catch(error => res.status(400).send(error));
});

app.get('/login', function(req,res){
    res.status(200).send("<a href='" + fusionAuthEndpoint + "/oauth2/authorize?client_id=" + fusionAuthClient + "&response_type=code&redirect_uri=" + encodeURIComponent(redirectUrlFusionAuth) + "'>Login</a>");
});

app.get('/logout', function(req,res){
    fetch(kwEndpoint, { headers: {"user_id" : fusionAuthClient, "user_token": "none", "user_end_session": "true" } })
    .then(subres => subres.json()) // expecting a json response
    .then(json => {
      console.log(json);
      if(!json.fromCache && !json.cached){
        res.redirect(302, fusionAuthEndpoint + "/oauth2/logout?client_id=" + fusionAuthClient + "&post_logout_redirect_uri=" + serviceEndpoint);
      }else{
        res.redirect(302, '/');
      }
    })
    .catch(error => res.status(400).send(error));
});


app.get('/data', function (req, res) {

    try{
        // Search for token on cache
        fetch(kwEndpoint, { headers: {"user_id" : fusionAuthClient, "user_token": "none", "user_end_session": "false" } })
        .then(subres => subres.json()) // expecting a json response
        .then(json => {
          if(json.token && json.token != "none"){
            console.log(json.token);
            const query = `{
                getItemApi2(id:1) {
                  item_id
                }
                getItemApi3(id:2) {
                  item_id
                }
              }`;

              request(graphqlEndpoint, query).then(data => {
                  res.status(200).send(data);
              }).catch(error => res.status(400).send(error));
          }else{
            res.redirect(302, '/login');
          }
        })
        .catch(error => res.status(400).send(error));
    }catch(e){
        res.status(500).send(e)
    }
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!");
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));