(function() {

  console.log('setting up extended node functionality');

  // function factory
  var extaudio = function() {
    // return value of the factory function
    var func = function() {
      if (typeof func.data === 'function') {
        return func.data()
      }
    }
    // getter/setter for bound data
    var data;
    func.all_data = function(obj) {
      if (obj) {
        data = func.__wrap(obj);
        return func;
      } else {
        return data;
      }
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
    // add an abstract getter function
    func.__add_extractor = function(obj) {
      obj.__extract = function(key) {
        if ( (key === 'start') || (key === 'end') ) {
          return func.seconds(obj[key]);
        }
        if (obj[key]) {
          return obj[key];
        } else {
          return false;
        }
      }
      return obj;
    }
    // extend all items in the data array with custom methods
    func.__wrap = function(data) {
      data = data.map(function(item) {
        item = func.__add_extractor(item);
        return item;
      });
      return data;
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
    // get exact timestamp from node
    func.timestamp = function() {
      var timestamp = node.currentTime;
      return timestamp;
    }
    // resolve string times in format DD:HH:MM:SS to integers
    func.seconds = function(time) {
      var has_colon,
          is_number,
          time_elements,
          hours,
          minutes,
          seconds;
      if (time.indexOf && time.indexOf(':') === -1) {
        has_colon = true;
      } else {
        has_colon = false;
      }
      is_number = typeof time === 'number';
      // if it's just a numerical value, return it
      if (!has_colon && is_number) {
        return time;
      } else {
        time_elements = time.split(':').reverse();
        seconds = parseInt(time_elements[0]) || 0;
        minutes = parseInt(time_elements[1]) || 0;
        hours = parseInt(time_elements[2]) || 0;
        days = parseInt(time_elements[3]) || 0;
      }
      seconds = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
      return seconds;
    }
    // test whether a timestamp is between a range
    func.test_breakpoints = function(breakpoints, timestamp) {
      var mode;
      timestamp = timestamp || this.timestamp();
      if (breakpoints.low) {
        mode = 'single'
      } else if (breakpoints.length && typeof breakpoints.map === 'function') {
        mode = 'multiple'
      }
      // if you only pass in one breakpoints object
      // test it and return a boolean
      if (mode === 'single') {
        return this.test_single_breakpoint(breakpoints, timestamp)
      // if you pass in an array of breakpoints objects,
      // test all and return a mapped array of booleans
      } else if (mode === 'multiple') {
        return this.test_multiple_breakpoints(breakpoints, timestamp);
      }
    }
    // test a single range
    func.test_single_breakpoint = function(breakpoints, timestamp) {
      var between = ( (breakpoints.low <= timestamp) && (timestamp <= breakpoints.high) )
      return between;
    }
    // test multiple ranges and return a map;
    // uses the single item test internally
    func.test_multiple_breakpoints = function(breakpoints, timestamp) {
      var betweens;
      timestamp = timestamp || this.timestamp();
      betweens = breakpoints.map(function(item) {
        var between;
        between = test_single_breakpoint(item, timestamp);
        return between;
      })
      return betweens;
    }
    // attach an arbitrary function under a key, and pass it
    // the scoped data via arguments
    func.extend = function(label, bound_function, breakpoints) {
      if (typeof label !== 'string' || typeof bound_function !== 'function') {
        return;
      }
      // if we're still running, bind the function with the current values
      func[label] = function() {
        var current_data, timestamp, in_range;
        timestamp = this.timestamp();
        current_data = this.data(timestamp);
        // exit if optional breakpoints are supplied but do not match
        if (breakpoints && !this.test_breakpoints(breakpoints, timestamp)) {
          return false;
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
        var between, breakpoints, start, end;
        start = item.__extract('start');
        end = item.__extract('end');
        if (!start || !end) {
          return false;
        }
        breakpoints = {low: start, high: end};
        between = func.test_breakpoints(breakpoints, timestamp);
        return between;
      });
      current_data = current_data.sort(function(a, b) {
        a_start = a.__extract('start');
        b_start = b.__extract('start');
        return a_start > b_start;
      })
      if (current_data.length === 0) {
        return false;
      } else {
        return current_data;
      }
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
        start = data[i].__extract('start');
        if (breakpoints.indexOf(start) === -1) {
          breakpoints.push(start);
        }
        // check end
        end = data[i].__extract('end');
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
