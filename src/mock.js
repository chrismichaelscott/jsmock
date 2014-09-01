define(function() {
	return function(object, flags) {
				
		var runFunctions = (flags && flags.runFunctions);
				
		var mock = {};
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
				
				var result;
				if (runFunctions) {
					result = object[methodName].apply(object, arguments);
				} else {
					result = undefined;
				}
				
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
			return  "\n   __         _         _     _                   _    " +
					"\n  / _|__ _ __| |_ _ __ (_)_ _| |_   _ __  ___  __| |__ " +
					"\n |  _/ _` / _|  _| '  \\| | ' \\  _| | '  \\/ _ \\/ _| / / " +
					"\n |_| \\__,_\\__|\\__|_|_|_|_|_||_\\__| |_|_|_\\___/\\__|_\\_\\ " +
					"\n ";
		};
		
		return mock;
	};
});