(function() {

  console.log('setting up extended audio functionality');

  // function factory
  var extaudio = function() {
    // return value of the factory function
    var func = function() {
      // calling the function will just call its own execution
      // methods, if they exist
      if (typeof func.execute === 'function') {
        func.execute();
      }
    }
    // getter/setter for bound data
    var data;
    func.data = function(obj) {
      if (obj) {
        data = obj;
        return func;
      } else {
        return data;
      }
    }
    // getter/setter for node
    var node;
    func.node = function(element) {
      if (element) {
        node = element;
        return func;
      } else {
        return node;
      }
    }
    // attach an arbitrary function under a key, and pass it
    // the scoped data via arguments
    func.bind_function = function(label, bound_function) {
      var current_data, timestamp;
      if (typeof label !== 'string' || typeof bound_function !== 'function') {
        return;
      }
      timestamp = this.get_current_timestamp();
      rounded_timestamp = this.get_rounded_timestamp();
      current_data = this.get_current_data(rounded_timestamp);
      func[label] = bound_function(current_data, timestamp, node);
    }
    // get data
    func.get_current_data = function() {
      var id, current_data, rounded_timestamp;
      rounded_timestamp = this.get_rounded_timestamp();
      id = 'time_' + rounded_timestamp;
      if (data[id]) {
        current_data = data[id];
      }
      return current_data;
    }
    // get exact timestamp from node
    func.get_current_timestamp = function() {
      var timestamp = node.currentTime;
      return timestamp;
    }
    // round timestamp down for use in hash lookup
    func.get_rounded_timestamp = function() {
      var timestamp, rounded_timestamp;
      timestamp = func.get_current_timestamp();
      rounded_timestamp = Math.floor(timestamp);
      return rounded_timestamp;
    }
    // get all timestamps registered in the data
    // object with time_ prefixes
    func.get_breakpoints = function() {
      var keys, times, breakpoints;
      keys = Object.keys(data);
      times = keys.filter(function(item) {
        return item.slice(0, 5) === 'time_';
      })
      breakpoints = times.map(function(item) {
        return parseInt(item.slice(5));
      });
      breakpoints = breakpoints.sort(function(a, b) {
        return a > b;
      });
      return breakpoints;
    }
    // get the breakpoints closest to a timestamp
    func.get_nearest_breakpoints = function(timestamp) {
      var breakpoints,
          current_breakpoint,
          lower_breakpoint,
          higher_breakpoint,
          nearest_breakpoints;
      // get breakpoints
      breakpoints = func.get_breakpoints();
      // loop through breakpoints
      for (var i = 0; i < breakpoints.length; i++) {
        // if we're on the first item in the array,
        // set the lower breakpoint to zero
        current_breakpoint = breakpoints[i];
        if (timestamp < breakpoints[0]) {
          lower_breakpoint = 0;
          higher_breakpoint = breakpoints[0];
        } else {
          // set lower and higher bounds
          if (current_breakpoint < timestamp) {
            lower_breakpoint = current_breakpoint;
          } else if (current_breakpoint > timestamp) {
            higher_breakpoint = current_breakpoint;
          }
        }
        // when both bounds are set, define the return value
        if (typeof lower_breakpoint !== 'undefined' && typeof higher_breakpoint !== 'undefined') {
          nearest_breakpoints = {
            lower: lower_breakpoint,
            higher: higher_breakpoint
          }
        }
        // if the return value is defined, return it
        if (nearest_breakpoints) {
          return nearest_breakpoints;
        }
      }
    }
    func.tick = function(iterator) {
      if (typeof iterator !== 'function') {
        return;
      }
      node.ontimeupdate = function() {
        var data, timestamp, rounded_timestamp;
        timestamp = func.get_current_timestamp();
        rounded_timestamp = func.get_rounded_timestamp();
        data = func.get_current_data(rounded_timestamp);
        iterator(data, timestamp, node);
      }
    }
    // run all functionality
    func.execute = function() {
      return;
    }
    // return results of the factory
    return func;
  }

  // attach factory to global space
  window.extaudio = extaudio;

}).call(this);
