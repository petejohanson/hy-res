'use strict';

var gulp = require('gulp'),
  lazypipe = require('lazypipe'),
  runSequence = require('run-sequence'),
  bump = require('gulp-bump'),
  gwebpack = require('gulp-webpack'),
  webpack = require('webpack'),
  header = require('gulp-header'),
  watch = require('gulp-watch'),
  karma = require('gulp-karma'),
  coveralls = require('gulp-coveralls'),
  shell = require('gulp-shell'),
  ghpages = require('gulp-gh-pages'),
  gls = require('gulp-live-server'),
  exit = require('gulp-exit'),
  mocha = require('gulp-mocha'),
  git = require('gulp-git'),
  tagVersion = require('gulp-tag-version'),
  util = require('gulp-util'),
  jshint = require('gulp-jshint');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %> - <%= now %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
  ' * @license MIT License, http://www.opensource.org/licenses/MIT',
  ' */',
  ''].join('\n');

var testServer;

function getJSHintPipe(rc) {
  return lazypipe()
    .pipe(jshint, rc || '.jshintrc')
    .pipe(jshint.reporter, 'jshint-stylish')
    .pipe(jshint.reporter, 'fail');
}

function jsSourcePipe() {
  return gulp.src('src/**/*.js');
}

gulp.task('karma:server-start', function(cb) {
  testServer = gls.new('test/spec/server.js');

  testServer.start().then(function(s) {
    cb();
  }, function(err) {
    cb(err);
  });
});

gulp.task('karma:server-stop', function(cb) {
  if (!testServer) {
    cb('Server not started');
  }

  testServer.stop().then(function() {
    cb();
  }, function(err) {
    cb(err);
  });

  testServer = undefined;
});

function karmaPipe(action, browsers, reporters) {
  var cfg = {
    configFile: 'karma.conf.js',
    action: action,
    client: {
      mocha: {
        timeout: '5000'
      }
    }
  };

  if (browsers) {
    cfg.browsers = browsers;
  }

  if (reporters) {
    cfg.reporters = reporters;
  }
  return gulp.src('test/spec/**/*.js')
    .pipe(karma(cfg))
    .on('error', function(err) {
      throw err;
    });
}

gulp.task('karma:watch', ['karma:server-start'], function() {
  return karmaPipe('watch');
});

gulp.task('karma:run', function() {
  return karmaPipe('run');
});

gulp.task('karma:ci-run', function() {
  return karmaPipe('run', ['SL_FireFox', 'SL_InternetExplorer', 'SL_Chrome'], ['mocha', 'coverage', 'saucelabs']);
});

gulp.task('karma:ci', function(cb) {
  runSequence(
    'karma:server-start',
    'karma:ci-run',
    'karma:server-stop',
    cb
  );
});

gulp.task('karma', function(cb) {
  runSequence(
    'karma:server-start',
    'karma:run',
    'karma:server-stop',
    cb
  );
});

gulp.task('jshint', ['jshint:src', 'jshint:test', 'jshint:gulpfile']);

gulp.task('jshint:src', function() {
  return jsSourcePipe()
    .pipe(getJSHintPipe()());
});

gulp.task('jshint:test', function() {
  return gulp.src('test/**/*.js')
    .pipe(getJSHintPipe('test/.jshintrc')());
});

gulp.task('jshint:gulpfile', function() {
  return gulp.src('gulpfile.js')
    .pipe(getJSHintPipe()());
});

gulp.task('test:watch', function() {
  return gulp.watch(['test/*.js', 'src/**/*.js'], ['test']);
});

gulp.task('jsdoc:watch', function() {
  return gulp.watch(['src/**/*.js', 'tutorials/*'], ['jsdoc']);
});

gulp.task('jsdoc', shell.task(['./node_modules/jsdoc/jsdoc.js . -c ./conf.json']));

gulp.task('bump', function() {
  return gulp.src(['package.json', 'bower.json'])
    .pipe(bump({ type: gulp.env.type || 'patch' }))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-commit', function() {
  var version = require('./package.json').version;
  return gulp.src(['package.json', 'bower.json'])
    .pipe(git.commit('Release v' + version));
});

gulp.task('tag', function() {
  return gulp.src('package.json')
    .pipe(tagVersion());
});

gulp.task('release', function(cb) {
  runSequence(
    'jshint',
    'bump',
    'bump-commit',
    'tag',
    cb
  );
});

gulp.task('gh-pages', ['jsdoc'], function() {
  return gulp.src('doc/**/*')
    .pipe(ghpages());
});

gulp.task('default', function(cb) {
  runSequence('jshint', 'karma', cb);
});

gulp.task('dist', function() {
  return jsSourcePipe()
    .pipe(gwebpack({
      output: {
        library: 'HyRes',
        filename: 'hy-res.js',
        libraryTarget: 'var'
      },
      externals: {
        'lodash': '_'
      }
    }))
    .pipe(header(banner, { pkg: require('./package.json'), now: (util.date(new Date(), 'yyyy-mm-dd')) }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('coverage', function() {
  gulp.src('coverage/**/lcov.info')
    //.pipe(coveralls())
    .pipe(shell([
      'cat "<%= file.path %>" | ./node_modules/.bin/codecov'
    ]));
});

gulp.task('ci', function(cb) {
  runSequence('jshint', 'karma:ci', ['coverage', 'jsdoc', 'dist'], cb);
});
