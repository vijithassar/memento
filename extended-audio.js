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
      func[label] = function() {
        timestamp = this.get_current_timestamp();
        rounded_timestamp = this.get_rounded_timestamp();
        current_data = this.get_current_data(rounded_timestamp);
        bound_function(current_data, timestamp, node);
      }
      return func;
    }
    // get data
    func.get_current_data = function() {
      var id,
          current_data,
          current_timestamp,
          rounded_timestamp,
          nearest_breakpoints;
      nearest_breakpoints = this.get_nearest_breakpoints(current_timestamp);
      if (nearest_breakpoints) {
        id = 'time_' + nearest_breakpoints.low;
        if (data[id]) {
          current_data = data[id];
        }
        return current_data;
      }
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
          nearest_breakpoints,
          current_breakpoint,
          between,
          next_breakpoint,
          timestamp = timestamp || this.get_current_timestamp();
      breakpoints = func.get_breakpoints();
      for (var i = 0; i < breakpoints.length; i++) {
        current_breakpoint = breakpoints[i];
        next_breakpoint = breakpoints[i + 1];
        between = current_breakpoint < timestamp && timestamp < next_breakpoint;
        if (between) {
          nearest_breakpoints = {low: current_breakpoint, high: next_breakpoint};
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
