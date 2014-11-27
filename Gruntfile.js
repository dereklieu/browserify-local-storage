'use strict';
module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        watch: {
            options: {
                debounceDelay: 1500
            },
            browserify: {
                files: [
                    'dist/localstorage.js',
                    'test/spec/*.js',
                ],
                tasks: ['browserify:test']
            },
        },

        mocha: {
            all: {
                src: ['tests/*.js'],
            },
            options: {
                run: true
            }
        },

        browserify: {
            test: {
                files: {
                    'test/test.js': [
                        'dist/localstorage.js',
                        'test/spec/*.js'
                    ],
                }
            },
        },

    });

    // TODO create a test here that opens a phantom webserver
    grunt.registerTask('test', []);
}
