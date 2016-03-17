'use strict';

var gulp = require('gulp'),
  path = require('path'),
  lazypipe = require('lazypipe'),
  karmaServer = require('karma').Server,
  runSequence = require('run-sequence'),
  bump = require('gulp-bump'),
  gwebpack = require('gulp-webpack'),
  header = require('gulp-header'),
  shell = require('gulp-shell'),
  ghpages = require('gulp-gh-pages'),
  coveralls = require('gulp-coveralls'),
  gls = require('gulp-live-server'),
  git = require('gulp-git'),
  tagVersion = require('gulp-tag-version'),
  util = require('gulp-util'),
  eslint = require('gulp-eslint');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %> - <%= now %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
  ' * @license MIT License, http://www.opensource.org/licenses/MIT',
  ' */',
  ''].join('\n');

var testServer;

function getLintPipe(rc) {
  return lazypipe()
    .pipe(eslint, rc || '.eslintrc.json')
    .pipe(eslint.format)
    .pipe(eslint.failAfterError);
}

function jsSourcePipe() {
  return gulp.src('src/**/*.js');
}

gulp.task('karma:server-start', function(cb) {
  testServer = gls.new('test/server.js');

  testServer.start().then(function() {
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

function runKarma(done, action, browsers, reporters) {
  var cfg = {
    configFile: path.join(__dirname, 'karma.conf.js'),
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

  new karmaServer(cfg, done).start();
}

gulp.task('karma:watch', ['karma:server-start'], function(done) {
  return runKarma(done, 'watch');
});

gulp.task('karma:run', function(done) {
  return runKarma(done, 'run');
});

gulp.task('karma:ci-run', function(done) {
  return runKarma(done, 'run', ['SL_FireFox', 'SL_InternetExplorer', 'SL_Chrome'], ['mocha', 'coverage', 'saucelabs']);
});

gulp.task('karma:ci', function(cb) {
  var runTask = process.env.SAUCE_ACCESS_KEY ? 'karma:ci-run' : 'karma:run';
  runSequence(
    'karma:server-start',
    runTask,
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

gulp.task('lint', ['lint:src', 'lint:test', 'lint:gulpfile']);

gulp.task('lint:src', function() {
  return jsSourcePipe()
    .pipe(getLintPipe('src/.eslintrc.json')());
});

gulp.task('lint:test', function() {
  return gulp.src('test/**/*.js')
    .pipe(getLintPipe('test/.eslintrc.json')());
});

gulp.task('lint:gulpfile', function() {
  return gulp.src('gulpfile.js')
    .pipe(getLintPipe()());
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

gulp.task('bump-commit', ['dist'], function() {
  var version = require('./package.json').version;
  return gulp.src(['dist/*.js', 'package.json', 'bower.json'])
    .pipe(git.commit('Release v' + version));
});

gulp.task('tag', function() {
  return gulp.src('package.json')
    .pipe(tagVersion());
});

gulp.task('release', function(cb) {
  runSequence(
    'lint',
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
  runSequence('lint', 'karma', cb);
});

gulp.task('dist', function() {
  return gulp.src('./index.js')
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
    .pipe(coveralls());
});

gulp.task('ci', function(cb) {
  runSequence('lint', 'karma:ci', ['coverage', 'jsdoc', 'dist'], cb);
});
