// function factory
var memento,
    update,
    seconds,
    test_single_breakpoint,
    test_multiple_breakpoints;

update = function(instance) {
    // every time the node updates
    instance.node().ontimeupdate = function() {
        var data,
            timestamp,
            actions,
            action,
            i;
        timestamp = instance.timestamp();
        data = instance.data();
        actions = instance.timed_actions(timestamp);
        for (i = 0; i < actions.length; i++) {
            action = actions[i];
            if (typeof action === 'function') {
                action.function(data, timestamp, instance.node());
            }
        }
    };
};

seconds = function(time) {
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
        seconds = time_elements[0] || '0';
        if (seconds.indexOf('.') !== -1) {
            seconds = parseFloat(seconds, 10);
        } else {
            seconds = parseInt(seconds, 10);
        }
        minutes = parseInt(time_elements[1], 10) || 0;
        hours = parseInt(time_elements[2], 10) || 0;
        days = parseInt(time_elements[3], 10) || 0;
    }
    seconds = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
    return seconds;
};

test_single_breakpoint = function(breakpoints, timestamp) {
    var between;
    // resolve breakpoints to numbers if necessary
    if (typeof timestamp !== 'number') {
        timestamp = seconds(timestamp);
    }
    if (typeof breakpoints.low !== 'number') {
        breakpoints.low = seconds(breakpoints.low);
    }
    if (typeof breakpoints.high !== 'number') {
        breakpoints.high = seconds(breakpoints.high);
    }
    // check timestamp position
    between = ((breakpoints.low <= timestamp) && (timestamp <= breakpoints.high));
    return between;
};

test_multiple_breakpoints = function(breakpoints, timestamp) {
    var betweens;
    betweens = breakpoints.map(function(item) {
        return test_single_breakpoint(item, timestamp);
    });
    return betweens;
};

memento = function() {
    // return value of the factory function
    var instance,
        data,
        node,
        actions;
    instance = {};
    // getter/setter for bound data
    instance.payload = function(new_data) {
        if (new_data) {
            data = new_data;
            return instance;
        } else {
            return data;
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
    actions = [];
    instance.add_action = function(new_function, start, end) {
        if (typeof new_function !== 'function') {
            console.error('action is not a function');
            return;
        }
        let action = {
            function: new_function
        };
        if (start) {
            action.start = seconds(start);
        }
        if (end) {
            action.end = seconds(end);
        }
        actions.push(action);
    };
    instance.all_actions = function() {
        return actions;
    };
    instance.timed_actions = function() {
        var all_actions,
            timed_actions,
            match;
        all_actions = instance.all_actions();
        timed_actions = all_actions.filter(function(item) {
            var breakpoints,
                both_undefined,
                one_undefined;
            both_undefined = !item.start && !item.end;
            one_undefined = ((!item.start && item.end) || (item.start && !item.end))
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
        update(instance);
    }
    // add a new item to the bound data
    instance.add_item = function(new_data) {
        if (! data || typeof data.map !== 'function') {
            data = [];
        }
        if (new_data) {
            data = data.concat(new_data);
            return data;
        }
    };
    // remove a bound item by index
    instance.remove_item = function(int) {
        if (typeof int !== 'number' || int > data.length) {
            console.error('array index to remove is invalid');
            return;
        }
        let result = data[int];
        data = data.filter(function(item, index) {
            return index !== int;
        });
        return result;
    };
    // get exact timestamp from node
    instance.timestamp = function() {
        return node.currentTime;
    };
    // resolve string times in format DD:HH:MM:SS to a number
    // of seconds
    instance.seconds = seconds;
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
            return test_single_breakpoint(breakpoints, timestamp);
        // if you pass in an array of breakpoints objects,
        // test all and return a mapped array of booleans
        } else if (mode === 'multiple') {
            return test_multiple_breakpoints(breakpoints, timestamp);
        }
    };
    // get data
    instance.data = function(timestamp) {
        var current_data;
        timestamp = timestamp || instance.timestamp()
        current_data = data.filter(function(item) {
            var between,
                breakpoints,
                start,
                end;
            start = item.start;
            end = item.end;
            if (!start || !end) {
                return false;
            }
            breakpoints = {low: start, high: end};
            between = instance.test_breakpoints(breakpoints, timestamp);
            return between;
        });
        if (current_data.length > 1) {
            current_data = current_data.sort(function(a, b) {
                var a_start,
                    b_start;
                a_start = a.start;
                b_start = b.start;
                return a_start > b_start;
            });
        }
        if (current_data.length === 0) {
            return false;
        } else {
            return current_data;
        }
    }
    // get all timestamps registered in the data
    // object
    instance.breakpoints = function() {
        var breakpoints,
            start,
            end,
            i;
        breakpoints = [];
        // for each item
        for (i = 0; i < data.length; i++) {
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
    };
    // get the breakpoints closest to a timestamp
    instance.nearest_breakpoints = function(timestamp) {
        var breakpoints,
            nearest_breakpoints,
            current_breakpoint,
            between,
            next_breakpoint,
            i;
        timestamp = timestamp || instance.timestamp();
        breakpoints = instance.breakpoints();
        for (i = 0; i < breakpoints.length; i++) {
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
        if (typeof label !== 'string') {
            console.error('label must be a string');
            return;
        }
        if (typeof bound_function !== 'function') {
            console.error('extend integration requires a function');
            return;
        }
        // if we're still running, bind the function with the current values
        instance[label] = function() {
            var timestamp,
                current_data;
            timestamp = instance.timestamp();
            current_data = instance.data(timestamp);
            bound_function(current_data, timestamp, node);
        }
        return instance;
    };
    // run a function every time the player updates
    instance.tick = function(breakpoints, iterator) {
        if (typeof iterator !== 'function') {
            console.error('tick integration requires a function')
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
            previous,
            event,
            event_label,
            event_handler;
        if (typeof trigger_function !== 'function') {
            console.error('trigger integration requires a function');
            return;
        }
        sent = false;
        // resolve trigger time to seconds in case it's a string
        trigger_time = seconds(trigger_time);
        event_label = 'trigger-' + trigger_time;
        event = new Event(event_label);
        event_handler = function() {
            var data,
                timestamp;
            data = instance.data();
            timestamp = instance.timestamp();
            trigger_function(data, timestamp, node);
        };
        instance.__add_action(event_handler, trigger_time, null);
        node.addEventListener(event_label, event_handler)
        instance.tick(true, function() {
            var timestamp,
                passed;
            timestamp = instance.timestamp();
            passed = timestamp > trigger_time;
            if (! previous || previous < timestamp) {
                sent = false;
            }
            previous = timestamp;
            if (passed && ! sent) {
                node.dispatchEvent(event);
                sent = true;
            }
        });
    };
    // return results of the factory
    return instance;
};

export { memento };