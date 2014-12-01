var fs = require('fs');
var path = require('path');
var wiredep = require('wiredep');

var files = [];

var bowerComponents = wiredep({
    devDependencies: true
});

if (bowerComponents) {
    files = files.concat(bowerComponents.js);
}
module.exports = function(config) {
    'use strict';

    config.set({
        autoWatch: true,
        basePath: './',
        frameworks: [
            'mocha',
            'chai',
            'sinon'
        ],
        files: files.concat([
            'src/**/*.module.js',
            'src/**/*.js',
            'src/**/*.html',
            'src/**/*.spec.js'
        ]),
        client: {
            mocha: {
                ui: 'bdd'
            }
        },
        exclude: [],
        port: 8180,
        browsers: ['PhantomJS'],
        singleRun: false,
        colors: true,
        logLevel: config.LOG_INFO,
        reporters: ['progress', 'junit'],
        junitReporter: {
            outputFile: 'build/reports/karma-report.xml'
        },
        plugins: [
            'karma-chai',
            'karma-mocha',
            'karma-phantomjs-launcher',
            'karma-sinon',
        ],
        preprocessors: {
            '**/*.html': 'ng-html2js'
        },
        ngHtml2JsPreprocessor: {
            moduleName: 'dir-templates',
            stripPrefix: 'src/'
        }
    });
};
