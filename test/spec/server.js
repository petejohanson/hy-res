'use strict';

var express = require('express');
var hal = require('express-hal');
var app = express();

app.use(hal.middleware);

app.route('/')
  .options(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*').sendStatus(204);
  })
  .get(function (req, res) {
    res.header('Access-Control-Allow-Origin', '*').type('application/hal+json').hal({
      links: {
        self: '/'
      }
    });
  });

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
