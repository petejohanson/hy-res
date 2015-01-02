'use strict';

var express = require('express');
var hal = require('express-hal');
var app = express();

app.use(hal.middleware);

app.get('/', function (req, res) {
  res.type('application/hal+json').hal({
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
