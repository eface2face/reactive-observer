var ObjectObservable = require('object-observable');

module.exports = function(Meteor)
{
	var Tracker = Meteor.Tracker;

	/**
	 * Construtor
	 * @param {[Object]} object  If set it must be an EventEmitter
	 */
	function ReactiveObserver(object)
	{
		var root = null;

		// Called without `new`
		if (!(this instanceof ReactiveObserver))
			return new ReactiveObserver(object);

		// Tracker dependencies
		var dep = new Tracker.Dependency;

		// Listener for 'change' event
		function listener()
		{
			// And fire dependency
			dep.changed();
		};

		/**
		 * Getter for the root object or a property in it
		 * @param  {[any]} key  Root object property to get
		 * @return {[any]}      The root object (may be undefined) if no `key` is given,
		 *                      or the value of a property if `key` is given (undefined
		 *                      if there is not root)
		 */
		this.get = function(key)
		{
			// If running inside a an active Tracker computation
			if (Tracker.active)
				dep.depend();

			if (arguments.length === 0)
				return root;
			else if (root)
				return root[key];
			else
				return undefined;
		};

		/**
		 * Setter for root object or properties
		 * @param {[any]} key    The root propertyey to set or whole root object to set if `value`
		 *                       if `value` is not given
		 * @param {[any]} value  Property value if `key` is given
		 */
		this.set = function(key, value)
		{
			switch (arguments.length)
			{
				// Whole root object setter
				case 1:
				{
					var object = key;

					// Unobserve previous root object (if any)
					if (root)
						ObjectObservable.unobserve(root, listener);

					// Check object is observable
					if (object && !ObjectObservable.isObservable(object))
						throw new TypeError('given `object` is not observable');

					// Set root object
					root = object;

					// Add listener
					root && ObjectObservable.observe(root, listener);

					// And fire dependency
					dep.changed();

					break;
				}

				// Property setter
				case 2:
				{
					// If root is not set throw
					if (!root)
						throw new Error('root not set');

					// Set property
					root[key] = value;

					// And fire dependency
					dep.changed();

					break;
				}

				default:
				{
					throw new TypeError('1 or 2 arguments must be given');
				}
			}
		};

		/**
		 * Delete given root property key
		 * @param  {any} key
		 */
		this.delete = function(key)
		{
			if (!root)
				return;

			if (!root.hasOwnProperty(key))
				return;

			// Remove property
			delete root[key];

			// And fire dependency
			dep.changed();
		};

		/**
		 * Check whether root object has a property
		 * @param  {[any]}  key
		 * @return {Boolean}
		 */
		this.has = function(key)
		{
			// If running inside a an active Tracker computation
			if (Tracker.active)
				dep.depend();

			if (!root)
				return false;

			return root.hasOwnProperty(key);
		};

		/**
		 * Get root property keys
		 * @return {Array}
		 */
		this.keys = function()
		{
			// If running inside a an active Tracker computation
			if (Tracker.active)
				dep.depend();

			if (!root)
				return [];

			// Return object keys
			return Object.keys(root);
		};

		/**
		 * Get root property values
		 * @return {Array}
		 */
		this.values = function()
		{
			// If running inside a an active Tracker computation
			if (Tracker.active)
				dep.depend();

			if (!root)
				return [];

			var values = [];

			for (var key in root)
			{
				if (root.hasOwnProperty(key))
					values.push(root[key]);
			}

			return values;
		};

		/**
		 * Return the list of root key/value
		 * @return {Array}
		 */
		this.entries = function()
		{
			// If running inside a an active Tracker computation
			if (Tracker.active)
				dep.depend();

			if (!root)
				return [];

			var entries = [];

			for (var key in root)
			{
				if (root.hasOwnProperty(key))
					entries.push([key, root[key]]);
			}

			return entries;
		};

		// Set root object (if given)
		if (object)
			this.set(object);
	}

	return ReactiveObserver;
};
