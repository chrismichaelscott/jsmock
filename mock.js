if (typeof(factmint) === "undefined") window['factmint'] = {};
factmint.mock = function(object, tools) {
  var mock = new Function();
  mock._invocationCounts = {};
  mock._invocationCallbacks = {};
  mock._readCounts = {};
  mock._readCallbacks = {};
  mock._changeCounts = {};
  mock._writeCallbacks = {};
  mock._methods = [];
  mock._members = [];
  
  var registerMember = function(memberName) {
    console.log("MOCK [DEBUG] - registering member " + memberName);
    
    mock._readCounts[memberName] = 0;
    mock._changeCounts[memberName] = 0;
    
    mock.__defineGetter__(memberName, function() {
      console.log("MOCK [INFO] - getting " + memberName);
      
      mock._readCounts[memberName]++;
      
      if (mock._readCallbacks[memberName] instanceof Function) {
        mock._readCallbacks[memberName](object[memberName]);
      }
      
      return object[memberName];
    });
    mock.__defineSetter__(memberName, function(newValue) {
      console.log("MOCK [INFO] - setting " + memberName);
      
      if (object[memberName] != newValue) {
        mock._changeCounts[memberName]++;
      }
      
      if (mock._writeCallbacks[memberName] instanceof Function) {
        mock._writeCallbacks[memberName](newValue);
      }
      
      object[memberName] = newValue;
    });
  };
  
  var registerMethod = function(methodName) {
    console.log("MOCK [DEBUG] - registering method " + methodName);
    
    mock._invocationCounts[methodName] = 0;
    
    mock[methodName] = function() {
      console.log("MOCK [INFO] - Verifying execution of " + methodName);
      
      var result = object[methodName].apply(object, arguments);
      mock._invocationCounts[methodName]++;
      
      if (mock._invocationCallbacks[methodName] instanceof Function) {
        mock._invocationCallbacks[methodName](result, mock._invocationCounts[methodName]);
      }
    };
  };
  
  for (var member in object) {
    if (object[member] instanceof Function) {
      registerMethod(member);
      mock._methods.push(member);
    } else {
      registerMember(member);
      mock._members.push(member);
    }
  }
  
  return mock;
};

factmint.verify = function(mock) {
  var verify = {};
  
  mock._members.forEach(function(memberName) {
    verify[memberName] = {
      hasBeenRead: function(comparison) {
        if (comparison instanceof Function) {
          return comparison(mock._readCounts[memberName]);
        } else if (typeof(comparison) == "number") {
          return (comparison == mock._readCounts[memberName]);
        } else if (! comparison) {
          return mock._readCounts[memberName] > 0;
        }
      },
      checkGets: function(callback) {
        mock._readCallbacks[memberName] = callback;
      },
      hasBeenChanged: function(comparison) {
        if (comparison instanceof Function) {
          return comparison(mock._changeCounts[memberName]);
        } else if (typeof(comparison) == "number") {
          return (comparison == mock._changeCounts[memberName]);
        } else if (! comparison) {
          return mock._changeCounts[memberName] > 0;
        }
      },
      checkSets: function(callback) {
        mock._writeCallbacks[memberName] = callback;
      }
    };
  });
  
  mock._methods.forEach(function(methodName) {
    verify[methodName] = {
      hasBeenInvoked: function(comparison) {
        if (comparison instanceof Function) {
          return comparison(mock._invocationCounts[methodName]);
        } else if (typeof(comparison) == "number") {
          return (comparison == mock._invocationCounts[methodName]);
        } else if (! comparison) {
          return mock._invocationCounts[methodName] > 0;
        }
      },
      checkInvocations: function(callback) {
        mock._invocationCallbacks[methodName] = callback;
      }
    };
  });
  
  return verify;
}
