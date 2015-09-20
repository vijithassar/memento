(function() {

  console.log('setting up extended node functionality');

  // function factory
  var extaudio = function() {
    // return value of the factory function
    var func = function() {
      // instance execution; currently just aliases to data()
      return this.data();
    }
    // getter/setter for bound data
    var data;
    func.all_data = function(obj) {
      if (obj) {
        data = obj;
        return func;
      } else {
        return data;
      }
    }
    // add a new item to the bound data
    func.add_item = function(new_data) {
      if (typeof data.map !== 'function') {
        data = [];
      }
      if (new_data) {
        data = data.concat(new_data);
        return data;
      }
    }
    // remove a bound item by index
    func.remove_item = function(int) {
      if (typeof int !== 'number') {
        return false;
      }
      data = data.filter(function(item, index) {
        return index !== int;
      })
      return data;
    }
    // getter/setter for media node
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
    func.extend = function(label, bound_function, breakpoints) {
      var current_data, timestamp, in_range;
      if (typeof label !== 'string' || typeof bound_function !== 'function') {
        return;
      }
      // if we're still running, bind the function with the current values
      func[label] = function() {
        timestamp = this.timestamp();
        rounded_timestamp = this.rounded_timestamp();
        current_data = this.data(rounded_timestamp);
        // exit if optional breakpoints are supplied but do not match
        if (breakpoints) {
          in_range = ((breakpoints.low <= timestamp) && (timestamp <= breakpoints.high))
          if (!in_range) {
            return false;
          }
        }
        bound_function(current_data, timestamp, node);
      }
      return func;
    }
    // get data
    func.data = function(timestamp) {
      var timestamp = timestamp || this.timestamp(),
          nearest_breakpoints,
          current_data;
      current_data = data.filter(function(item) {
        var between;
        if (!item.start || !item.end) {
          return false;
        }
        between = (item.start <= timestamp) && (timestamp <= item.end);
        return between;
      });
      current_data.sort(function(a, b) {
        return a.start > b.start;
      })
      if (current_data.length === 0) {
        return false;
      } else {
        return current_data;
      }
    }
    // get exact timestamp from node
    func.timestamp = function() {
      var timestamp = node.currentTime;
      return timestamp;
    }
    // round timestamp down for use in less precise lookups
    func.rounded_timestamp = function() {
      var timestamp, rounded_timestamp;
      timestamp = func.timestamp();
      rounded_timestamp = Math.floor(timestamp);
      return rounded_timestamp;
    }
    // get all timestamps registered in the data
    // object with time_ prefixes
    func.breakpoints = function() {
      var breakpoints, start, end;
      breakpoints = [];
      // for each item
      for (var i = 0; i < data.length; i++) {
        // check start
        start = data[i].start;
        if (breakpoints.indexOf(start) === -1) {
          breakpoints.push(start);
        }
        // check end
        end = data[i].end;
        if (breakpoints.indexOf(end) === -1) {
          breakpoints.push(end);
        }
      }
      // sort chronologically
      breakpoints = breakpoints.sort(function(a, b) {
        return a > b;
      });
      return breakpoints;
    }
    // get the breakpoints closest to a timestamp
    func.nearest_breakpoints = function(timestamp) {
      var breakpoints,
          nearest_breakpoints,
          current_breakpoint,
          between,
          next_breakpoint,
          timestamp = timestamp || this.timestamp();
      breakpoints = func.breakpoints();
      for (var i = 0; i < breakpoints.length; i++) {
        current_breakpoint = breakpoints[i];
        next_breakpoint = breakpoints[i + 1];
        // if the timestamp is between one breakpoint and the next
        between = current_breakpoint < timestamp && timestamp < next_breakpoint;
        if (between) {
          // return both values as an object
          nearest_breakpoints = {low: current_breakpoint, high: next_breakpoint};
          return nearest_breakpoints;
        }
      }
    }
    // run a function every time the player updates
    func.tick = function(iterator) {
      if (typeof iterator !== 'function') {
        return;
      }
      // every time the node updates
      node.ontimeupdate = function() {
        var data, timestamp, rounded_timestamp;
        // assign all values
        timestamp = func.timestamp();
        data = func.data(timestamp);
        // run the function with the scoped values
        iterator(data, timestamp, node);
      }
    }
    // return results of the factory
    return func;
  }

  // attach factory to global space
  window.extaudio = extaudio;

}).call(this);
