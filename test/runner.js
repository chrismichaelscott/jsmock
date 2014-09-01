"use strict";
require.config({
	paths: {
		'QUnit': '../bower_components/qunit/qunit/qunit'
	},
	shim: {
		'QUnit': {
			exports: 'QUnit',
			init: function() {
				QUnit.config.autoload = false;
				QUnit.config.autostart = false;
			}
		} 
	}
});

require(['QUnit', 'test-suite/loaded', 'test-suite/mock', 'test-suite/verify'], function(QUnit, test1, test2, test3) {
	test1();
	test2();
	test3();
	
	QUnit.load();
	QUnit.start();
});