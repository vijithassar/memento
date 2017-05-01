// function factory
var memento;

memento = function() {
  // return value of the factory function
  var instance,
      data,
      input,
      node;
  instance = {};
  // getter/setter for bound data
  instance.all_data = function(obj) {
    if (obj) {
      input = obj;
      data = instance.__wrap(obj);
      return instance;
    } else {
      return input;
    }
  };
  // getter/setter for media node
  instance.node = function(element) {
    if (element) {
      node = element;
      return instance;
    } else {
      return node;
    }
  };
  // add an abstract getter function
  instance.__add_extractor = function(obj) {
    obj.__extract = function(key) {
      if ( (key === 'start') || (key === 'end') ) {
        if (obj[key]) {
          return instance.seconds(obj[key]);
        }
      }
      if (obj[key]) {
        return obj[key];
      } else {
        return false;
      }
    }
    return obj;
  };
  // extend all items in the data array with custom methods
  instance.__wrap = function(data) {
    var wrapped;
    wrapped = data.map(function(item) {
      item = instance.__add_extractor(item);
      return item;
    });
    return wrapped;
  };
  instance.__update = function() {
    // every time the node updates
    node.ontimeupdate = function() {
      var data,
          timestamp,
          actions,
          action;
      timestamp = instance.timestamp();
      data = instance.data();
      actions = instance.timed_actions(timestamp);
      for (var i = 0; i < actions.length; i++) {
        action = actions[i];
        if (typeof action === 'function') {
          action(data, timestamp, node);
        }
      }
    };
  };
  instance.__actions = [];
  instance.__add_action = function(new_function, start, end) {
    if (start) {
        new_function.start = start;
    }
    if (end) {
        new_function.end = end;
    }
    instance.__actions.push(new_function);
  };
  instance.all_actions = function() {
    var actions;
    actions = instance.__actions;
    return actions;
  };
  instance.timed_actions = function(timestamp) {
    var all_actions,
        timed_actions,
        match;
    timestamp = timestamp || instance.timestamp();
    all_actions = instance.all_actions();
    timed_actions = all_actions.filter(function(item) {
      var breakpoints,
          both_undefined,
          either_undefined,
          one_undefined;
      both_undefined = !item.start && !item.end;
      either_undefined = !item.start || !item.end;
      one_undefined = ( (!item.start && item.end) || (item.start && !item.end) )
      if (both_undefined) {
        return true;
      }
      if (one_undefined) {
        return false;
      }
      if (!item.start || !item.end) {
        return false;
      } else {
        breakpoints = {low: item.start, high: item.end};
        match = instance.test_breakpoints(breakpoints);
        return match;
      }
    });
    return timed_actions;
  };
  instance.watch = function() {
    instance.__update();
  }
  // add a new item to the bound data
  instance.add_item = function(new_data) {
    if (typeof input.map !== 'function') {
      input = [];
    }
    if (new_data) {
      input = input.concat(new_data);
      data = instance.__wrap(input);
      return input;
    }
  };
  // remove a bound item by index
  instance.remove_item = function(int) {
    var filtered;
    if (typeof int !== 'number') {
      return false;
    }
    filtered = data.filter(function(item, index) {
      return index !== int;
    });
    input = filtered;
    data = instance.__wrap(input);
    return input;
  };
  // get exact timestamp from node
  instance.timestamp = function() {
    var timestamp;
    timestamp = node.currentTime;
    return timestamp;
  };
  // resolve string times in format DD:HH:MM:SS to a number
  // of seconds
  instance.seconds = function(time) {
    var has_colon,
        is_number,
        time_elements,
        days,
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
      seconds = time_elements[0] || "0";
      if (seconds.indexOf('.') !== -1) {
        seconds = parseFloat(seconds);
      } else {
        seconds = parseInt(seconds);
      }
      minutes = parseInt(time_elements[1]) || 0;
      hours = parseInt(time_elements[2]) || 0;
      days = parseInt(time_elements[3]) || 0;
    }
    seconds = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
    return seconds;
  };
  // test whether a timestamp is between a range
  instance.test_breakpoints = function(breakpoints, timestamp) {
    var mode;
    timestamp = timestamp || instance.timestamp();
    if (breakpoints.low) {
      mode = 'single';
    } else if (breakpoints.length && typeof breakpoints.map === 'function') {
      mode = 'multiple';
    }
    // if you only pass in one breakpoints object
    // test it and return a boolean
    if (mode === 'single') {
      return instance.test_single_breakpoint(breakpoints, timestamp);
    // if you pass in an array of breakpoints objects,
    // test all and return a mapped array of booleans
    } else if (mode === 'multiple') {
      return instance.test_multiple_breakpoints(breakpoints, timestamp);
    }
  };
  // test a single range
  instance.test_single_breakpoint = function(breakpoints, timestamp) {
    var between;
    // resolve breakpoints to numbers if necessary
    if (typeof timestamp !== 'number') {
      timestamp = instance.seconds(timestamp);
    }
    if (typeof breakpoints.low !== 'number') {
      breakpoints.low = instance.seconds(breakpoints.low);
    }
    if (typeof breakpoints.high !== 'number') {
      breakpoints.high = instance.seconds(breakpoints.high);
    }
    // check timestamp position
    between = ( (breakpoints.low <= timestamp) && (timestamp <= breakpoints.high) );
    return between;
  };
  // test multiple ranges and return a map;
  // uses the single item test internally
  instance.test_multiple_breakpoints = function(breakpoints, timestamp) {
    var betweens;
    timestamp = timestamp || instance.timestamp();
    betweens = breakpoints.map(function(item) {
      var between;
      between = instance.test_single_breakpoint(item, timestamp);
      return between;
    });
    return betweens;
  };
  // get data
  instance.data = function(timestamp) {
    var timestamp = timestamp || instance.timestamp(),
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
      between = instance.test_breakpoints(breakpoints, timestamp);
      return between;
    });
    if (current_data.length > 1) {
      current_data = current_data.sort(function(a, b) {
        var a_start, b_start;
        a_start = a.__extract('start');
        b_start = b.__extract('start');
        return a_start > b_start;
      });
    }
    if (current_data.length === 0) {
      return false;
    } else {
      return current_data;
    }
  }
  // round timestamp down for use in less precise lookups
  instance.rounded_timestamp = function() {
    var timestamp,
        rounded_timestamp;
    timestamp = instance.timestamp();
    rounded_timestamp = Math.floor(timestamp);
    return rounded_timestamp;
  };
  // get all timestamps registered in the data
  // object with time_ prefixes
  instance.breakpoints = function() {
    var breakpoints,
        start,
        end;
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
  };
  // get the breakpoints closest to a timestamp
  instance.nearest_breakpoints = function(timestamp) {
    var breakpoints,
        nearest_breakpoints,
        current_breakpoint,
        between,
        next_breakpoint,
        timestamp;
    timestamp = timestamp || instance.timestamp();
    breakpoints = instance.breakpoints();
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
  };
  // attach an arbitrary function under a key, and pass it
  // the scoped data via arguments
  instance.extend = function(label, bound_function) {
    if (typeof label !== 'string' || typeof bound_function !== 'function') {
      return;
    }
    // if we're still running, bind the function with the current values
    instance[label] = function() {
      var timestamp,
          current_data,
          in_range;
      timestamp = instance.timestamp();
      current_data = instance.data(timestamp);
      bound_function(current_data, timestamp, node);
    }
    return instance;
  };
  // run a function every time the player updates
  instance.tick = function(breakpoints, iterator) {
    if (typeof iterator !== 'function') {
      return;
    }
    if (breakpoints === true) {
      instance.__add_action(iterator);
    }
    if (breakpoints.low && breakpoints.high) {
      instance.__add_action(iterator, breakpoints.low, breakpoints.high);
    }
  };
  // fire a function once when the trigger time is passed
  instance.trigger = function(trigger_time, trigger_function) {
    var sent,
        counter,
        event,
        event_label,
        event_handler,
        trigger_start;
    sent = false;
    // resolve trigger time to seconds in case it's a string
    trigger_time = instance.seconds(trigger_time);
    event_label = 'trigger-' + trigger_time;
    event = new Event(event_label);
    event_handler = function(event) {
      var data, timestamp;
      data = instance.data();
      timestamp = instance.timestamp();
      trigger_function(data, timestamp, node);
    };
    instance.__add_action(event_handler, trigger_time, null);
    node.addEventListener(event_label, event_handler)
    instance.tick(true, function() {
      var timestamp,
          passed;
      if (sent) {
        return;
      } else {
        timestamp = instance.timestamp();
        passed = timestamp > trigger_time;
        if (passed) {
          node.dispatchEvent(event);
          sent = true;
        }
      }
    });
  };
  // return results of the factory
  return instance;
};

export { memento };