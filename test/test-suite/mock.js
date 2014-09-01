define(['QUnit', '../../src/mock'], function(QUnit, mock) {
	var exampleObject = {
		name: "Charles",
		doSomething: function() {
			return "true";
		}
	};
	
	return function() {
		QUnit.test( "Check that mocks contain all of the properties of the original", function(assert) {
			var exampleMock = mock(exampleObject);
			ok(exampleMock, "The mock is created successfully");
			
			ok(exampleMock.hasOwnProperty("name"), 'The "name" property is available in the mock');
			ok(exampleMock.hasOwnProperty("doSomething"), 'The "doSomething" property is available in the mock');
		});
		
		QUnit.test( "Check that mocked functions are short circuited", function(assert) {
			var exampleMock = mock(exampleObject);
			
			equal(exampleMock.doSomething(), undefined, 'The "doSomething" method does not execute');
		});
		
		QUnit.test( "Check that mocked functions can be called and ran themselves", function(assert) {
			var exampleMock = mock(exampleObject, {runFunctions: true});
			
			ok(exampleMock.doSomething(), 'The "doSomething" method executes and returns true');
		});
	}
});