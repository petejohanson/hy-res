'use strict';

var express = require('express');
var hal = require('express-hal');
var bodyParser = require('body-parser');
var app = express();

app.use(hal.middleware);
app.use(bodyParser.urlencoded({ extended: true }));

app.route('/')
  .options(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .header('Access-Control-Allow-Methods', 'GET,OPTIONS')
       .header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type')
       .sendStatus(204);
  })
  .get(function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');

    res.format({
      'application/hal+json': function() {
        res.hal({
          links: {
            self: '/',
            'thing-template': { href: '/things{/id}', templated: true }
          }
        });
      },
      'application/vnd.siren+json': function() {
        res.json({
          links: [
            { rel: ['self'], href: '/' }
          ],
          actions: [
            {
              name: 'create-form',
              title: 'New Post',
              href: '/posts',
              method: 'POST',
              fields: [
                { name: 'title', title: 'Title' },
                { name: 'post', title: 'Post' },
              ]
            }
          ]
        });
      }
    });
  });

app.route('/posts')
  .options(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .header('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
       .header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type')
       .sendStatus(204);
  })
  .post(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .sendStatus(204);
  });

app.route('/things/:id')
  .options(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .header('Access-Control-Allow-Methods', 'GET,OPTIONS')
       .header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type')
       .sendStatus(204);
  })
 .get(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*').type('application/hal+json').hal({
      links: {
        self: req.url
      }
    });
  });

var server = app.listen(10000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
