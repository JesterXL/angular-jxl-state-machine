module.exports = function (grunt) {
    'use strict';
    

   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-express');

    var tasks = {
        

        // Runs unit tests
        karma: {
            test: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        jshint: {
            options: {
                force: true,
                jshintrc: '.jshintrc'
            },

            src: ['src/**/*.js', '!Gruntfile.js']
        },

        clean: {
            prod: {
                src: ['dist', 'temp']
            },

            buildProcess: {
                src: 'temp'
            }
        },

        concat: {
            prod: {
                cwd: '.',
                expand: true,
                files: {
                    'dist/jxlStateMachine.js': [
                        'temp/src/**/*.module.js',
                        'temp/src/**/*.js',
                        '!temp/src/**/*.spec.js']
                }
                
            }
        },

        ngAnnotate: {
            prod: {
                options: {
                    and: true,
                    singleQuotes: true
                },
                files: [{
                    expand: true,
                    cwd: '.',
                    src: [
                        'src/*.js',
                        'src/**/**.js',
                        '!src/**.spec.js'
                    ],
                    dest: 'temp'
                }] 
            }
        },

        copy: {
            demo: {
                cwd: '.',
                src: 'dist/jxlStateMachine.js',
                dest: 'demo/jxlStateMachine.js'
            },

            demoLibs: {
                expand: true,
                flatten: true,
                cwd: '.',
                src: ['bower_components/angular/angular.js'],
                dest: 'demo/'
            },
        },

        express: {
            localServer:
            {
                options:
                {
                    port: 8626,
                    bases: './demo',
                    debug: true,
                    open: true
                }
            }
        },

    };

    grunt.initConfig(tasks);

    grunt.registerTask('test',
        'Runs all unit tests based on the karm.conf.js configurations.', [
            'karma'
    ]);

    grunt.registerTask('build',
        'Builds production version of library.',
        ['clean', 'ngAnnotate', 'concat', 'copy', 'clean:buildProcess']);

    grunt.registerTask('demo',
        'Shows the demo in action by launching a local webserver.',
        ['build', 'express', 'express-keepalive']);
};
