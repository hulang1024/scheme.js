
var Config = (function() {
	var defaults = {
		ide: {
			GUILanguage: 'en_US'
		},
		view: {
			fontSize: 15,
			toolbar: {
				show: false
			}
		},
	};

	return function(name) {
		var storage = {};

		function initDefaults() {
			var data = defaults[name];
			for(var key in data) {
				storage[key] = data[key];
			}
		}
		initDefaults();

		if(window.localStorage[name]) {
			var data = JSON.parse(window.localStorage[name]);
			for(var key in data) {
				storage[key] = data[key];
			}
		}

		return {
			get: function(key) {
				var keys = key.split('.');
				var value = storage;
				while(keys.length)
					value = value[ keys.shift() ];
				return value;
			},
			set: function(key, value) {
				var keys = key.split('.');
				var obj = storage;
				while(keys.length > 1) {
					key = keys.shift();
					obj = obj[key];
				}
				obj[keys.shift()] = value;

				window.localStorage[name] = JSON.stringify(storage);
			},
			clear: function () {
				delete window.localStorage[name];
			}
		};
	}

})();