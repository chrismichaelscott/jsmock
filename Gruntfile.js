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

	grunt.registerTask('build', ['requirejs', 'connect:test', 'qunit']);
};
