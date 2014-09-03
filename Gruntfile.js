module.exports = function(grunt) {
	grunt.initConfig({
		requirejs: {
			compile: {
				options: {
					baseUrl: "src",
					name: "almond",
					include: ["global"],
					out: "dist/global.js",
					paths: {
						almond: "../node_modules/almond/almond"
					},
					wrap: {
						startFile: "etc/startFragment.js",
						endFile: "etc/endFragment.js"
					}
				}
			}
		},
		comments: {
			js: {
				src: 'dist/global.js'
			}
		},
		concat: {
			dist: {
				src: ['etc/licenseBanner.txt', 'dist/global.js'],
				dest: 'dist/global.js'
			}
		},
		connect: {
			options: {
                base: ".",
			},
            test: {
                options: {
                    keepalive: false,
                    port: 8001
                }
            }
        },
        qunit: {
            checkBuild: {
                options: {
                    httpBase: 'http://localhost:8001'
                },
                src: 'test/globals.html'
            }
        }
	});
	
	grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-stripcomments');
    grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('build', ['requirejs', 'comments', 'concat', 'connect:test', 'qunit']);
};
