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
    
    mock._invocationCounts[methodName] = {
      all: 0,
      arguments: {}
    };
    
    mock[methodName] = function() {
      console.log("MOCK [INFO] - Verifying execution of " + methodName);
      
      var result = object[methodName].apply(object, arguments);
      mock._invocationCounts[methodName].all++;
      
      var argumentsKey = JSON.stringify(arguments);
      if (! mock._invocationCounts[methodName][argumentsKey]) {
        mock._invocationCounts[methodName][argumentsKey] = 1;
      } else {
        mock._invocationCounts[methodName][argumentsKey]++;
      }
      
      if (mock._invocationCallbacks[methodName] instanceof Function) {
        mock._invocationCallbacks[methodName](result, mock._invocationCounts[methodName]);
      }

      return result;
    };

    mock[methodName].toString = function() {
      return "factmint.mock of " + methodName;
    }
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

  mock.toString = function() {
    return "\n   __         _         _     _                   _    " +
           "\n  / _|__ _ __| |_ _ __ (_)_ _| |_   _ __  ___  __| |__ " +
           "\n |  _/ _` / _|  _| '  \| | ' \  _| | '  \/ _ \/ _| / / " +
           "\n |_| \__,_\__|\__|_|_|_|_|_||_\__| |_|_|_\___/\__|_\_\ " +
           "\n ";
  };
  
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
          return comparison(mock._invocationCounts[methodName].all);
        } else if (typeof(comparison) == "number") {
          return (comparison == mock._invocationCounts[methodName].all);
        } else if (! comparison) {
          return mock._invocationCounts[methodName].all > 0;
        }
      },
      withArguments: function() {
		var invocationArguments = JSON.stringify(arguments);
        return {
          hasBeenInvoked: function(comparison) {
            if (comparison instanceof Function) {
              return comparison(mock._invocationCounts[methodName][invocationArguments]);
            } else if (typeof(comparison) == "number") {
              if (comparison == 0 && typeof(mock._invocationCounts[methodName][invocationArguments]) === "undefined") {
                return true;
              }

              return (comparison == mock._invocationCounts[methodName][invocationArguments]);
            } else if (! comparison) {
              return mock._invocationCounts[methodName][invocationArguments] > 0;
            }
          }
        }
      },
      checkInvocations: function(callback) {
        mock._invocationCallbacks[methodName] = callback;
      }
    };
  });
  
  return verify;
}
