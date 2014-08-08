# jsmock

A light-weight JavaScript object mocking tool-kit. This project focuses on helping developers write clean, readable unit test with testing frameworks like QUnit.

## Seperation of concerns

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

jsmock, can be used to make this all a bit nice. First, create a mock of the `factmint.service.visualizationPlugin`:

      var mockVisualizationPluginService = factmint.mock({
        setPlugin: function(pluginId) {}
      });

Now you can verify things like the number of invokations:

    test("VisualizationPluginPickerControllerTest", function() {
      var testScope = {};
      
      var mockVisualizationPluginService = factmint.mock({
        setPlugin: function(pluginId) {}
      });
      
      var controllerUnderTest = factmint.test.createController('VisualizationPluginPickerController', {'$scope': testScope, 'factmint.service.visualizationPlugin': mockVisualizationPluginService});
      testScope.plugin = {
        id: 99
      }
      testScope.update();
      
      ok(factmint.verify(mockVisualizationPluginService).setPlugin.withArguments(99).hasBeenInvoked(), "The plugin ID was updated correctly");
    });

## How to use jsmock
### factmint.mock

The `factmint.mock` function creates a mock of any object. Use it like this:

    var myMock = factmint.mock({
      name: "Chris",
      sex: "male",
      password: "itsasecret",
      resetPassword: function(newPassword) {
        password = newPassword;
      }
    });

or:

    var myMock = factmint.mock(new User());

### factmint.verify

The `factmint.verify` function takes a mocked object as its only argument:

    var myMock(new User());
    factmint.verify(myMock);

To access to verification tools use the name of the mocked objects properties:

    var myMock(new User());
    factmint.verify(myMock).name; // contains all of the verify methods for the "name" property

#### Checking that a property has been read

`.hasBeenRead()` checks that a property has been read at least once - returns a boolean;
`.hasBeenRead(n)` checks that a property has been read exactly n times, where n is an `Integer` - returns a boolean;
`.hasBeenRead(comparitor)` passes the number of reads of the property to `comparitor`, which is a callback function - returns a boolean;

For example:

    var myMock(new User());
    factmint.verify(myMock).name.hasBeenRead(); // returns false
    
    console.log(myMock.name);
    factmint.verify(myMock).name.hasBeenRead(); // returns true
    
    console.log(myMock.name);
    factmint.verify(myMock).name.hasBeenRead(); // returns true
    factmint.verify(myMock).name.hasBeenRead(1); // returns false
    factmint.verify(myMock).name.hasBeenRead(2); // returns true
    
    console.log(myMock.name);
    factmint.verify(myMock).name.hasBeenRead(function(readCount) {
      return readCount % 2 == 0; // have an even number of reads occurred?
    }); // returns false

#### Inspecting property reads

`.checkGets(checker)` registers a function to be called when a property is read.

For example:

    var myMock(new User());
    factmint.verify(myMock).sex.checkGets(function(value) {
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
    factmint.verify(myMock).name.hasBeenChanged(); // returns false
    
    myMock.name = "Christopher";
    factmint.verify(myMock).name.hasBeenChanged(); // returns true
    
    myMock.name = "Christopher";
    factmint.verify(myMock).name.hasBeenChanged(2); // returns false
    
    myMock.name = "Alex";
    factmint.verify(myMock).name.hasBeenChanged(2); // returns true
    
    factmint.verify(myMock).name.hasBeenChanged(function(changeCount) {
      return changeCount % 2 == 0; // have an even number of changes occurred?
    }); // returns true

#### Inspecting property updates

`.checkSets(checker)` registers a function to be called when a property is updated.

For example:

    var myMock(new User());
    factmint.verify(myMock).sex.checkSets(function(value) {
      console.log("sex was set as " + value);
    });
    myMock.sex = "male";

#### Checking that a function property has been invoked

`.hasBeenInvoked()` checks that a function property has been invoked at least once - returns a boolean;
`.hasBeenInvoked(n)` checks that a function property has been invoked exactly n times, where n is an `Integer` - returns a boolean;
`.hasBeenInvoked(comparitor)` passes the number of invocations of the property to `comparitor`, which is a callback function - returns a boolean;

For example:

    var myMock(new User());
    factmint.verify(myMock).resetPassword.hasBeenInvoked(); // returns false
    
    myMock.resetPassword("nomypassword");
    factmint.verify(myMock).resetPassword.hasBeenInvoked(); // returns true
    factmint.verify(myMock).resetPassword.hasBeenInvoked(2); // returns false
    
    factmint.verify(myMock).resetPassword.hasBeenInvoked(function(invocationCount) {
      return invocationCount > 2 == 0; // has the function been invoked more than twice?
    }); // returns false

#### Inspecting invocation details

`.checkInvocations(checker)` registers a function to be called when a function property is invoked. The callback takes two arguments: the value returned by the function being inspected and the number of invocations of that function, so far.

For example:

    var myMock(new User());
    factmint.verify(myMock).resetPassword.checkInvocations(function(resultFromCall, numberOfInvocations) {
      console.log("The new password is a secret");
    });
    myMock.resetPassword("p4ssw0rd");

#### Verifying invocations with different arguments

Both the `hasBeenInvoked` and `checkInvocation` methods can be be applied only when sepcific arguments are used; this is achieved using the `.withArguments` method.

`withArguments([arg1][, arg2][, ...])` can be used as a filter on a function property. The result is an object with the same parameters, `checkInvocation` and `hasBeenInvoked`. An example use is:

    var myMock(new User());
    factmint.verify(myMock).resetPassword.withArguments("password").checkInvocations(function(resultFromCall, numberOfInvocations) {
      console.log("the test password was applied");
    });
    myMock.resetPassword("secret"); // doesn't trigger checker
    myMock.resetPassword("p4ssw0rd"); // does trigger checker

## Have a play

[On codepen.io](http://codepen.io/chrismichaelscott/pen/IyAhG)
