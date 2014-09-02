define(['QUnit', '../../src/mock', '../../src/verify'], function(QUnit, mock, verify) {
	return function() {
		QUnit.test( "Check the modules are loaded", function(assert) {
			assert.ok(mock, 'The "mock" module should have loaded');
			assert.ok(verify, 'The "verify" module should have loaded');
		});
	};
});