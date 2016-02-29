var debug = require('debug')('reactive-observer');


module.exports = function(Meteor) {

	var Tracker = Meteor.Tracker;

	function ReactiveObserver(object)
	{
		var root = null;
		
		// called without `new`
		if (!(this instanceof ReactiveObserver))
			return new ReactiveObserver(object);
		
		//Check object is obsevable
		if (object && (!object.on || !object.off))
			throw new Exception('Object is not observable');
		
		//Tracker dependencies
		var dep  = new Tracker.Dependency;
		
		//Change listener
		var listener = function() {
			//And fire dependency
			dep.changed();
		};

		// Gettter for root object or a property in it
		this.get = function(key) {
			//If running inside a an active Tracker computation
			if(Tracker.active)
				//Add a dependency
				dep.depend();

			if (key)
				return root[key];
			else
				return root;
		};

		// Settter for root object and properties
		this.set = function()
		{
			//If only called with one argument
			if(arguments.length === 1)
			{
				//Unobserve object
				root && root.off(listener);
				//Set root object
				root = arguments[0];
				//Check object is obsevable
				if (root && (!root.on || !root.off))
					throw new Exception('Object is not observable');
				//And fire dependency
				dep.changed();
			} else if (root) {
				//Get path, value and corresponding object
				var key = arguments[0];
				var value = arguments[1];
				//Set property
				root[key] = value;
				//And fire dependency
				dep.changed();
			}
		};
		
		this.has = function(key) {
			//If running inside a an active Tracker computation
			if(Tracker.active)
				//Add a dependency
				dep.depend();

			if (!root)
				return;

			//Check if it has the key
			return root.hasOwnProperty (key);
		};
		
		this.keys = function() {
			//If running inside a an active Tracker computation
			if(Tracker.active)
				//Add a dependency
				dep.depend();

			if (!root)
				return [];

			//Return object keys
			return Object.keys(root);
		};
		
		this.values = function() {
			var values = [];
			//If running inside a an active Tracker computation
			if(Tracker.active)
				//Add a dependency
				dep.depend();

			if (!root)
				return [];

			//For each key in object
			for (var key in root)
				if (root.hasOwnProperty (key))
					//Add to values
					values.push(root[key]);

			//REturn keys
			return values;
		};
		
		this.entries = function() {
			var entries = [];
			//If running inside a an active Tracker computation
			if(Tracker.active)
				//Add a dependency
				dep.depend();

			if (!root)
				return [];

			//For each key in object
			for (var key in root)
				if (root.hasOwnProperty (key))
					//Add to values
					entries.push([key,root[key]]);
			//REturn keys
			return entries;
		};

		this.delete = function(key) {
			if (!root)
				return;

			if (!root.hasOwnProperty(key))
				return;

			//Get corresponding object
			var object = root[key];

			// Remove from root object
			delete root[key];
		};
		
		//Set object
		this.set(object);
	}

	return ReactiveObserver;
};
