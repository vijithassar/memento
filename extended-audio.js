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
    // getter/setter for audio node
    var audio;
    func.audio = function(element) {
      if (element) {
        audio = element;
        return func;
      } else {
        return audio;
      }
    }
    // attach an arbitrary function under a key, and pass it
    // the scoped data via arguments
    func.extend = function(label, bound_function) {
      var current_data, timestamp;
      if (typeof label !== 'string' || typeof bound_function !== 'function') {
        return;
      }
      func[label] = function() {
        timestamp = this.timestamp();
        rounded_timestamp = this.rounded_timestamp();
        current_data = this.data(rounded_timestamp);
        bound_function(current_data, timestamp, audio);
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
//        console.log(item.start, timestamp, item.end, between);
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
    // get exact timestamp from audio
    func.timestamp = function() {
      var timestamp = audio.currentTime;
      return timestamp;
    }
    // round timestamp down for use in hash lookup
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
      for (var i = 0; i < data.length; i++) {
        start = data[i].start;
        end = data[i].end;
        if (breakpoints.indexOf(start) === -1) {
          breakpoints.push(start);
        }
        if (breakpoints.indexOf(end) === -1) {
          breakpoints.push(end);
        }
      }
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
        between = current_breakpoint < timestamp && timestamp < next_breakpoint;
        if (between) {
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
      audio.ontimeupdate = function() {
        var data, timestamp, rounded_timestamp;
        timestamp = func.timestamp();
        rounded_timestamp = func.rounded_timestamp();
        data = func.data(rounded_timestamp);
        iterator(data, timestamp, audio);
      }
    }
    // run all functionality? doesn't do anything!
    func.execute = function() {
      return;
    }
    // return results of the factory
    return func;
  }

  // attach factory to global space
  window.extaudio = extaudio;

}).call(this);
