'use strict';

var gulp = require('gulp'),
  lazypipe = require('lazypipe'),
  runSequence = require('run-sequence'),
  bump = require('gulp-bump'),
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
  jshint = require('gulp-jshint');

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

function karmaPipe(action) {
  return gulp.src('test/spec/**/*.js')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: action
    })).on('error', function(err) {
      throw err;
    });
}

gulp.task('karma:watch', ['karma:server-start'], function() {
  return karmaPipe('watch');
});

gulp.task('karma:run', function() {
  return karmaPipe('run');
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
  return gulp.src('package.json')
    .pipe(bump({ type: gulp.env.type || 'patch' }))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-commit', function() {
  var version = require('./package.json').version;
  return gulp.src(['package.json'])
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

gulp.task('coverage', function() {
  gulp.src('coverage/**/lcov.info')
    //.pipe(coveralls())
    .pipe(shell([
      'cat "<%= file.path %>" | ./node_modules/.bin/codecov'
    ]));
});

gulp.task('ci', function(cb) {
  runSequence('default', ['coverage', 'jsdoc'], cb);
});
