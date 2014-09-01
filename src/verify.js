define(function() {
	return function(mock) {
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
});