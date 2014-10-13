# jsmock

A light-weight JavaScript object mocking tool-kit. This project focuses on helping developers write clean, readable unit test with testing frameworks like QUnit.

## In a nutshell:

    var myMock = jsmock.mock(userRESTClient);
    
    // The user controller needs a REST client...
    // but that's not goot for testing as the service may not be up
    // so give it a mock
    var controllerUnderTest = new userController(myMock);
    
    jsmock.when(myMock).getUsers.thenReturn(["Abe", "Bob", "Carol"]);
    
    QUnit.test("Ensure the user list is created", function(assert) {
        var htmlSnippit = controllerUnderTest.getUserList();
        // the controller itself is going to call "getUsers" on the rest client, but that has been stubbed
        assert.equal(htmlSnippit, "<ul><li>Abe</li><li>Bob</li><li>Carol</li></ul>", "The HTML list is created");
    });

### Getting started

#### Get the source

jsmock is available as a [Bower](http://bower.io) component, so the easiest way to get it is:

    bower install jsmock

or, to add it to your bower.json

    bower install --save-dev jsmock

If you would prefer, you can just download the source from [here](https://s3-eu-west-1.amazonaws.com/chrisscott/jsmock/jsmock-0.3.1.js) or Github.

#### Use it

If you are using an AMD loader, like require.js, then you want something like this:

    "use strict";
    require.config({
        paths: {
		    'QUnit': 'bower_components/qunit/qunit/qunit',
		    'mock': 'bower_components/jsmock/src/mock',
		    'when': 'bower_components/jsmock/src/when',
		    'verify': 'bower_components/jsmock/src/verify'
        },
    });
	
    require(['QUnit', 'mock', 'when', 'verify'], function(QUnit, mock, when, verify) {
        // do some testing
    });

If you prefer a simple global, then use:

    <script type="application/javascript" src="bower_components/jsmock/dist/global.js"></script>

And in the test:

    var myMock = jsmock.mock(someObject);

## Why mock?

Mocking and stubbing of code, particularly dependencies, is really useful when seperating concerns.

Consider the following code:

    factmint.app.controller("VisualizationPluginPickerController", ['$scope', 'factmint.service.visualizationPlugin', function($scope, visualizationPluginService) {
      $scope.plugins = visualizationPluginService.getAvailablePlugins();
      $scope.plugin = $scope.plugins[0];
      visualizationPluginService.setPlugin($scope.plugin.id);
      
      $scope.update = function() {
        visualizationPluginService.setPlugin($scope.plugin.id);
      };
    }]);

This is a simplified version of a controller we use at [Factmint](http://factmint.com/ "Factmint: knowledge from data").

The principal of seperating concerns is to unit test just the controller, and not the service (`factmint.service.visualizationPlugin`) that is injected into it.

For the sake of brevity some of the Angular wiring has been ommitted here, but a qUnit test may look like this:

    test("VisualizationPluginPickerControllerTest", function() {
      var testScope = {};
      
      var mockVisualizationPluginService = {
        setPlugin: function(pluginId) {
          ok(true, "Hollay! The plugin has been set");
        }
      };
      
      var controllerUnderTest = factmint.test.createController('VisualizationPluginPickerController', {'$scope': testScope, 'factmint.service.visualizationPlugin': mockVisualizationPluginService});
      testScope.plugin = {
        id: 99
      }
      testScope.update();
    });

That works, but there are a few problems:
- The same `ok` assertion is called twice but it's testing two bits of code (setting the initial plugin and updating the plugin)
- It's not testing that the `$scope.update()` method is setting the correct id (it cannot because it can't destinguish between the two calls)
- It's difficult to read because the assertion is not defined in the same place as the test login

jsmock, can be used to make this all a bit nicer. First, create a mock of the `factmint.service.visualizationPlugin`:

      var mockVisualizationPluginService = jsmock.mock({
        setPlugin: function(pluginId) {}
      });

Now you can verify things like the number of invokations:

    test("VisualizationPluginPickerControllerTest", function() {
      var testScope = {};
      
      var mockVisualizationPluginService = jsmock.mock({
        setPlugin: function(pluginId) {}
      });
      
      var controllerUnderTest = factmint.test.createController('VisualizationPluginPickerController', {'$scope': testScope, 'factmint.service.visualizationPlugin': mockVisualizationPluginService});
      testScope.plugin = {
        id: 99
      }
      testScope.update();
      
      ok(jsmock.verify(mockVisualizationPluginService).setPlugin.withArguments(99).hasBeenInvoked(), "The plugin ID was updated correctly");
    });

## How to use jsmock
### jsmock.mock

The `jsmock.mock` function creates a mock of any object. Use it like this:

    var myMock = jsmock.mock({
      name: "Chris",
      sex: "male",
      password: "itsasecret",
      resetPassword: function(newPassword) {
        password = newPassword;
      }
    });

or:

    var myMock = jsmock.mock(new User());

By default, the functionality of mocked objects will be stubbed out. You can allow the actual functions to run by supplying an option to `.mock()`:

    var myMock = jsmock.mock(new User(), {runFunctions: true});

### jsmock.when

This function is used to stub out functionality of the mock. This is particularly useful when testing a module with dependencies, where there should be a seperation of concerns.

The `jsmock.when` function takes a mocked object as its only argument:

    var myMock(new User());
    jsmock.when(myMock);

To access to stubbing tools use the name of the mocked objects function properties:

    var myMock(new User());
    jsmock.when(myMock).resetPassword; // contains all of the verify methods for the "name" property

#### Stubbing out a function property

`.thenReturn(value)` will cause the stubbed function to return `value`;
`.thenThrow(value)` will cause the stubbed function to throw `value`;
`.then(function)` will cause `function` to be ran instead of the stubbed function and it's return value returned in place;

For example:

    var myMock(new User());
    jsmock.when(myMock).resetPassword.thenReturn("success");
    
    myMock.resetPassword(); // returns "success", regardless of the stubbed method

#### Accessing arguments of a subbed function

In the case then one uses `.then(function)` to stub a function, the call arguments of the mocked function will be passed to the sub. This can be useful for dealing with callbacks. For example, consider the following object:

    var httpService = {
        get: function(url, callback) {
            var xhr = new XMLHttpRequest();
            // ..do some XHR setup
            xhr.onreadstatechange = function() {
            	callback(xhr.response);
            }
        }
    };
    
    // usage:
    httpService.get("http://test.com", function(message) {
    	console.log(message);
    }

Here we may want to mock out the http call but still pass it's result to the callback. Just write the mock as if it had the same arguments:

    var mockHttpService = jsmock.mock(httpService);
    jsmock.when(mockHttpService).get.then(function(url, callback) {
    	callback("I'm a response!");
    });
    
    // usage:
    mockHttpService.get("http://test.com", function(message) {
    	message == "I'm a response!";
    }

#### Stubbing out a function property conditionally upon its arguments

The `thenReturn`, `thenThrow` and `then` methods can be be applied only when sepcific arguments are used; this is achieved using the `.withArguments` method.

`withArguments([arg1][, arg2][, ...])` can be used as a filter on a function property. This method is fluent and returns an object with the same properties. An example use is:

    var myMock(new User());
    jsmock.when(myMock).resetPassword.withArguments(rightPassword).thenReturn("success");
    jsmock.when(myMock).resetPassword.withArguments(wrongPassword).thenReturn("failure");
    
    myMock.resetPassword(rightPassword); // returns "success", regardless of the stubbed method
    myMock.resetPassword(wrongPassword); // returns "failure", regardless of the stubbed method

### jsmock.verify

The `jsmock.verify` function takes a mocked object as its only argument:

    var myMock(new User());
    jsmock.verify(myMock);

To access to verification tools use the name of the mocked objects properties:

    var myMock(new User());
    jsmock.verify(myMock).name; // contains all of the verify methods for the "name" property

#### Checking that a property has been read

`.hasBeenRead()` checks that a property has been read at least once - returns a boolean;
`.hasBeenRead(n)` checks that a property has been read exactly n times, where n is an `Integer` - returns a boolean;
`.hasBeenRead(comparitor)` passes the number of reads of the property to `comparitor`, which is a callback function - returns a boolean;

For example:

    var myMock(new User());
    jsmock.verify(myMock).name.hasBeenRead(); // returns false
    
    console.log(myMock.name);
    jsmock.verify(myMock).name.hasBeenRead(); // returns true
    
    console.log(myMock.name);
    jsmock.verify(myMock).name.hasBeenRead(); // returns true
    jsmock.verify(myMock).name.hasBeenRead(1); // returns false
    jsmock.verify(myMock).name.hasBeenRead(2); // returns true
    
    console.log(myMock.name);
    jsmock.verify(myMock).name.hasBeenRead(function(readCount) {
      return readCount % 2 == 0; // have an even number of reads occurred?
    }); // returns false

#### Inspecting property reads

`.checkGets(checker)` registers a function to be called when a property is read.

For example:

    var myMock(new User());
    jsmock.verify(myMock).sex.checkGets(function(value) {
      console.log("sex " + value + " was read");
    });
    myMock.sex;

#### Checking that a property has been changed

Note: a change means that the value of the property has become different, in a non-strict sense. So setting a property to the same value multiple times will not count as changes.

`.hasBeenChanged()` checks that a property has been changed at least once - returns a boolean;
`.hasBeenChanged(n)` checks that a property has been changed exactly n times, where n is an `Integer` - returns a boolean;
`.hasBeenChanged(comparitor)` passes the number of changes of the property to `comparitor`, which is a callback function - returns a boolean;

For example:

    var myMock(new User());
    jsmock.verify(myMock).name.hasBeenChanged(); // returns false
    
    myMock.name = "Christopher";
    jsmock.verify(myMock).name.hasBeenChanged(); // returns true
    
    myMock.name = "Christopher";
    jsmock.verify(myMock).name.hasBeenChanged(2); // returns false
    
    myMock.name = "Alex";
    jsmock.verify(myMock).name.hasBeenChanged(2); // returns true
    
    jsmock.verify(myMock).name.hasBeenChanged(function(changeCount) {
      return changeCount % 2 == 0; // have an even number of changes occurred?
    }); // returns true

#### Inspecting property updates

`.checkSets(checker)` registers a function to be called when a property is updated.

For example:

    var myMock(new User());
    jsmock.verify(myMock).sex.checkSets(function(value) {
      console.log("sex was set as " + value);
    });
    myMock.sex = "male";

#### Checking that a function property has been invoked

`.hasBeenInvoked()` checks that a function property has been invoked at least once - returns a boolean;
`.hasBeenInvoked(n)` checks that a function property has been invoked exactly n times, where n is an `Integer` - returns a boolean;
`.hasBeenInvoked(comparitor)` passes the number of invocations of the property to `comparitor`, which is a callback function - returns a boolean;

For example:

    var myMock(new User());
    jsmock.verify(myMock).resetPassword.hasBeenInvoked(); // returns false
    
    myMock.resetPassword("nomypassword");
    jsmock.verify(myMock).resetPassword.hasBeenInvoked(); // returns true
    jsmock.verify(myMock).resetPassword.hasBeenInvoked(2); // returns false
    
    jsmock.verify(myMock).resetPassword.hasBeenInvoked(function(invocationCount) {
      return invocationCount > 2 == 0; // has the function been invoked more than twice?
    }); // returns false

#### Inspecting invocation details

`.checkInvocations(checker)` registers a function to be called when a function property is invoked. The callback takes two arguments: the value returned by the function being inspected and the number of invocations of that function, so far.

For example:

    var myMock(new User());
    jsmock.verify(myMock).resetPassword.checkInvocations(function(resultFromCall, numberOfInvocations) {
      console.log("The new password is a secret");
    });
    myMock.resetPassword("p4ssw0rd");

#### Verifying invocations with different arguments

Both the `hasBeenInvoked` and `checkInvocation` methods can be be applied only when sepcific arguments are used; this is achieved using the `.withArguments` method.

`withArguments([arg1][, arg2][, ...])` can be used as a filter on a function property. The result is an object with the same parameters, `checkInvocation` and `hasBeenInvoked`. An example use is:

    var myMock(new User());
    jsmock.verify(myMock).resetPassword.withArguments("password").checkInvocations(function(resultFromCall, numberOfInvocations) {
      console.log("the test password was applied");
    });
    myMock.resetPassword("secret"); // doesn't trigger checker
    myMock.resetPassword("p4ssw0rd"); // does trigger checker

## Have a play

[On codepen.io](http://codepen.io/chrismichaelscott/pen/IyAhG)
