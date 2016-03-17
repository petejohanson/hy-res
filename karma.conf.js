// Karma configuration
// Generated on Sat Apr 26 2014 22:22:28 GMT-0400 (EDT)

module.exports = function(config) {
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    'SL_InternetExplorer': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '10'
    },
    'SL_FireFox': {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    'SL_Android': {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.4'
    }
  };
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'es5-shim'],

    proxies: {
      '/api': 'http://localhost:10000/api'
    },

    // list of files / patterns to load in the browser
    files: [
      'test/spec/**/*.js',
      'test/integration/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],

    // Limit to 5 to match current SauceLabs account limit.
    concurrency: 5,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/spec/**/*.js': ['webpack', 'sourcemap'],
      'test/integration/**/*.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage', 'saucelabs'],

    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    webpack: {
      devtool: 'inline-source-map',
      module: {
        noParse: /sinon\.js$/,
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules\/(axios|chai)/
          }
        ],
        postLoaders: [ {
          test: /\.js$/,
          exclude: /(test|node_modules|bower_components)\//,
          loader: 'istanbul-instrumenter'
        } ]
      },
      resolve: {
        alias: {
          sinon: 'sinon/pkg/sinon.js'
        }
      }
    },

    browserNoActivityTimeout: 120000,
    browserDisconnectTimeout: 120000,
    captureTimeout: 120000,

    sauceLabs: {
      testName: 'petejohanson/hy-res'
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

    customLaunchers: customLaunchers,
    browsers: ['Firefox'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
