module.exports = function (grunt) {
    'use strict';
    

   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-contrib-jshint');
    
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
        }

    };

    grunt.initConfig(tasks);

    grunt.registerTask('test',
        'Runs all unit tests based on the karm.conf.js configurations.', [
            'karma'
    ]);

};
