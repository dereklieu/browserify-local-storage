'use strict';
module.exports = function (grunt) {

    // require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                debounceDelay: 1500
            },
            dist: {
                files: [
                    'assets/scripts/*.js',
                    'assets/scripts/utility/*.js',
                ],
                tasks: ['browserify:build']
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
            options: {
            },
            build: {
                files: {
                    'build/scripts/site.js': [
                        'assets/scripts/utility/*.js',
                        'assets/scripts/*.js',
                    ],
                }
            },
        },

    });

    grunt.registerTask('default', []);
    grunt.registerTask('test', ['mocha']);
}
