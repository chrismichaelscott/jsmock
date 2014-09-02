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
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.registerTask('build', ['requirejs']);
};
