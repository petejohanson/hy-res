'use strict';

var express = require('express');
var hal = require('express-hal');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();

app.use(hal.middleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer());

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
      'application/vnd.collection+json': function() {
        res.json({
          collection: {
            href: '/',
            links: [
              { rel: 'posts', href: '/posts' }
            ],

            items: [
              {
                'href' : 'http://example.org/friends/jdoe',
                'data' : [
                  {'name' : 'full-name', 'value' : 'J. Doe', 'prompt' : 'Full Name'},
                  {'name' : 'email', 'value' : 'jdoe@example.org', 'prompt' : 'Email'}
                ],
                'links' : [
                  {'rel' : 'blog', 'href' : 'http://examples.org/blogs/jdoe', 'prompt' : 'Blog'},
                  {'rel' : 'avatar', 'href' : 'http://examples.org/images/jdoe', 'prompt' : 'Avatar', 'render' : 'image'}
                ]
              },

              {
                'href' : 'http://example.org/friends/msmith',
                'data' : [
                  {'name' : 'full-name', 'value' : 'M. Smith', 'prompt' : 'Full Name'},
                  {'name' : 'email', 'value' : 'msmith@example.org', 'prompt' : 'Email'}
                ],
                'links' : [
                  {'rel' : 'blog', 'href' : 'http://examples.org/blogs/msmith', 'prompt' : 'Blog'},
                  {'rel' : 'avatar', 'href' : 'http://examples.org/images/msmith', 'prompt' : 'Avatar', 'render' : 'image'}
                ]
              }
            ],

            template: {
              data: [
                { name: 'name', prompt: 'Name' },
                { name: 'subject', prompt: 'Subject' }
              ]
            }
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
              name: 'search',
              title: 'Search Posts',
              href: '/posts',
              fields: [
                { name: 'q', title: 'Search' }
              ]
            },
            {
              name: 'create-form',
              title: 'New Post',
              href: '/posts',
              method: 'POST',
              fields: [
                { name: 'title', title: 'Title' },
                { name: 'post', title: 'Post' },
              ]
            },
            {
              name: 'edit-form',
              title: 'Edit Post',
              href: '/posts/1',
              method: 'PUT',
              type: 'multipart/form-data',
              fields: [
                { name: 'title', title: 'Title', value: 'First Post!' },
                { name: 'post', title: 'Post', value: 'hy-res rocks!' },
              ]
            },
            {
              name: 'edit-form-json',
              title: 'Edit Post',
              href: '/posts/1',
              method: 'PUT',
              type: 'application/json',
              fields: [
                { name: 'title', title: 'Title', value: 'First Post!' },
                { name: 'post', title: 'Post', value: 'hy-res rocks!' },
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
  .get(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .json(req.query);
  })
  .post(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .type('json')
       .json(req.body);
  });

app.route('/posts/:id')
  .options(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .header('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT')
       .header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type')
       .sendStatus(204);
  })
 .put(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*')
       .json(req.body);
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
