define(['QUnit', '../../src/mock', '../../src/verify'], function(QUnit, mock, verify) {
	var exampleObject = {
		name: "Charles",
		doSomething: function() {
			return "true";
		}
	};
	
	return function() {
		QUnit.test( "Check that invokations are tracked", function(assert) {
			var testMock = mock(exampleObject);
			
			equal(verify(testMock).doSomething.hasBeenInvoked(), false, "The method has not been invoked");
			testMock.doSomething();
			
			equal(verify(testMock).doSomething.hasBeenInvoked(), true, "The method has been invoked");
			equal(verify(testMock).doSomething.hasBeenInvoked(1), true, "The method has been invoked exactly once");
			equal(verify(testMock).doSomething.hasBeenInvoked(2), false, "The method has not been invoked exactly twice");
			
			testMock.doSomething();
			equal(verify(testMock).doSomething.hasBeenInvoked(2), true, "The method has now been invoked exactly twice");
			
			equal(verify(testMock).doSomething.hasBeenInvoked(function(count) {
				return count % 2 === 0;
			}), true, "The method has been invoked an even number of times");
		});
		
		QUnit.test( "Check that invokations are tracked by argument", function(assert) {
			var testMock = mock(exampleObject);
			
			equal(verify(testMock).doSomething.withArguments(1, 2, 3).hasBeenInvoked(), false, "The method has not been invoked with the supplied arguments");

			testMock.doSomething(3, 2, 1);
			
			equal(verify(testMock).doSomething.withArguments(1, 2, 3).hasBeenInvoked(), false, "The method still has not been invoked with the supplied arguments (but with different args)");

			testMock.doSomething(1, 2, 3);

			equal(verify(testMock).doSomething.withArguments(1, 2, 3).hasBeenInvoked(), true, "The method has been invoked with the supplied arguments");
		});
		
		QUnit.test( "Check that reads are tracked", function(assert) {
			var testMock = mock(exampleObject);
			
			equal(verify(testMock).name.hasBeenRead(), false, "The property has not been read");
			testMock.name;
			
			equal(verify(testMock).name.hasBeenRead(), true, "The property has been read");
			equal(verify(testMock).name.hasBeenRead(1), true, "The property has been read exactly once");
			equal(verify(testMock).name.hasBeenRead(2), false, "The property has not been read exactly twice");
			
			testMock.name;
			equal(verify(testMock).name.hasBeenRead(2), true, "The property has now been read exactly twice");
			
			equal(verify(testMock).name.hasBeenRead(function(count) {
				return count % 2 === 0;
			}), true, "The property has been read an even number of times");
		});
		
		QUnit.test( "Check that property changes are tracked", function(assert) {
			var testMock = mock(exampleObject);
			
			equal(verify(testMock).name.hasBeenChanged(), false, "The property has not been changed");
			testMock.name = "Sam";
			
			equal(verify(testMock).name.hasBeenChanged(), true, "The property has been changed");
			equal(verify(testMock).name.hasBeenChanged(1), true, "The property has been changed exactly once");
			equal(verify(testMock).name.hasBeenChanged(2), false, "The property has not been changed exactly twice");
			
			testMock.name = "Sam";
			equal(verify(testMock).name.hasBeenChanged(1), true, "The property has not been been changed as it was set to the same value");
			
			testMock.name = "Gordon";
			equal(verify(testMock).name.hasBeenChanged(2), true, "The property has not been been changed exactly twice");
			
			equal(verify(testMock).name.hasBeenChanged(function(count) {
				return count % 2 === 0;
			}), true, "The property has been changed an even number of times");
		});
	}
});