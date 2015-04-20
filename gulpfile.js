'use strict';

var gulp = require('gulp'),
  lazypipe = require('lazypipe'),
  runSequence = require('run-sequence'),
  bump = require('gulp-bump'),
  watch = require('gulp-watch'),
  karma = require('gulp-karma'),
  gls = require('gulp-live-server'),
  exit = require('gulp-exit'),
  mocha = require('gulp-mocha'),
  git = require('gulp-git'),
  tagVersion = require('gulp-tag-version'),
  jshint = require('gulp-jshint');


function getJSHintPipe(rc) {
  return lazypipe()
    .pipe(jshint, rc || '.jshintrc')
    .pipe(jshint.reporter, 'jshint-stylish')
    .pipe(jshint.reporter, 'fail');
}

function jsSourcePipe() {
  return gulp.src('src/**/*.js');
}

gulp.task('server:karma', function(cb) {
  gls.new('test/spec/server.js').start().then(function(s) {
    cb();
  }, function(err) {
    cb(err);
  });
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

gulp.task('karma:watch', ['server:karma'], function() {
  return karmaPipe('watch');
});

gulp.task('karma', ['server:karma'], function() {
  return karmaPipe('run')
    .pipe(exit());
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
  gulp.watch(['test/*.js', 'src/**/*.js'], ['test']);
});

gulp.task('bump', function() {
  return gulp.src('./*.json')
    .pipe(bump({ type: gulp.env.type || 'patch' }))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-commit', function() {
  var version = require('./package.json').version;
  return gulp.src(['./*.json'])
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

gulp.task('default', function() {
  return runSequence('jshint', 'karma');
});
