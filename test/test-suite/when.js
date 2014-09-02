define(['QUnit', '../../src/mock', '../../src/when'], function(QUnit, mock, when) {
	var hasMadeHTTPRequest = false;
	
	var http = {
		get: function(url) {
			hasMadeHTTPRequest = true;
		}
	};
	
	return function() {
		QUnit.test( "Check that actions can be mocked with a function", function(assert) {
			var testMock = mock(http);
			var hasRanStubFunction = false;
			
			when(testMock).get.then(function() {
				hasRanStubFunction = true;
			});
			
			testMock.get();
			
			assert.equal(hasMadeHTTPRequest, false, 'The "real" function should not have ran');
			assert.equal(hasRanStubFunction, true, 'The stub function should have ran');
		});
		
		QUnit.test( "Check that actions can be mocked with a return value", function(assert) {
			var testMock = mock(http);
			var testResult = "Hello";

			when(testMock).get.thenReturn(testResult);
			
			var result = testMock.get();
			
			assert.equal(hasMadeHTTPRequest, false, 'The "real" function should not have ran');
			assert.equal(result, testResult, 'The stubbed function should have returned the testResult');
		});
		
		QUnit.test( "Check that actions can be mocked with an exception", function(assert) {
			var testMock = mock(http);
			var testException = "Help!";

			when(testMock).get.thenThrow(testException);
			
			assert.throws(testMock.get, testException, "The stubbed function should throw an exception");
		});
	}
});