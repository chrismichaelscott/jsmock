define(function() {
	return function(mock) {
		var when = {};
		
		mock._methods.forEach(function(methodName) {
			when[methodName] = {
				thenReturn: function(value) {
					mock._stubs[methodName].all = {
						type: "RETURN_VALUE",
						value: value
					};
				},
				thenThrow: function(value) {
					mock._stubs[methodName].all = {
						type: "EXCEPTION",
						value: value
					};
				},
				then: function(value) {
					mock._stubs[methodName].all = {
						type: "FUNCTION",
						value: value
					};
				},
				withArguments: function() {
					var invocationArguments = JSON.stringify(arguments);
					return {
						thenReturn: function(value) {
							mock._stubs[methodName].arguments[invocationArguments] = {
								type: "RETURN_VALUE",
								value: value
							};
						},
						thenThrow: function(value) {
							mock._stubs[methodName].arguments[invocationArguments] = {
								type: "EXCEPTION",
								value: value
							};
						},
						then: function(value) {
							mock._stubs[methodName].arguments[invocationArguments] = {
								type: "FUNCTION",
								value: value
							};
						}
					}
				}
			};
		});
		
		return when;
	}
});