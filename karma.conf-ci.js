// Karma configuration
// Generated on Sat Apr 26 2014 22:22:28 GMT-0400 (EDT)

module.exports = function(config) {
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
//    },
//    'SL_InternetExplorer': {
//      base: 'SauceLabs',
//      browserName: 'internet explorer',
//      version: '10'
//    },
//    'SL_FireFox': {
//      base: 'SauceLabs',
//      browserName: 'firefox',
    }
  };
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'es5-shim', 'sinon'],


    // list of files / patterns to load in the browser
    files: [
      'test/spec/**/*.js'
    ],


    // list of files to exclude
    exclude: [
      'test/spec/server.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/spec/**/*.js': ['webpack', 'sourcemap'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'saucelabs'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    webpack: {
      devtool: 'inline-source-map'
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
    browsers: Object.keys(customLaunchers),

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
