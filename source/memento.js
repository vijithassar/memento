var factory,
    update,
    seconds,
    between,
    matching_data,
    breakpoints,
    nearest_breakpoints,
    validate_actions;

update = function(api) {
    if (! api) {
        console.error('no api object specified for watching');
        return;
    }
    // every time the node updates
    api.node().ontimeupdate = function() {
        var matching,
            timestamp,
            actions,
            action,
            i;
        timestamp = api.timestamp();
        matching = api.bang();
        actions = api.timedActions(timestamp);
        for (i = 0; i < actions.length; i++) {
            action = actions[i];
            if (typeof action === 'function') {
                action.function(matching, timestamp, api.node());
            }
        }
    };
};

// resolve string times in format DD:HH:MM:SS to a number
// of seconds
seconds = function(time) {
    var has_colon,
        is_number,
        time_elements,
        days,
        hours,
        minutes,
        seconds;
    if (typeof time !== 'string' && typeof time !== 'number') {
        console.error('seconds helper can only process strings in DD:HH:MM:SS format');
        return;
    }
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
    if (typeof seconds === 'number') {
        return seconds;
    } else {
        console.error('could not parse ' + time + ' into seconds');
    }
};

between = function(breakpoints, timestamp) {
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
    return (breakpoints.low <= timestamp) && (timestamp <= breakpoints.high);
};

// get data for a timestamp
matching_data = function(timestamp, all_data) {
    var matches;
    matches = all_data.filter(function(item) {
        if (! item.start || ! item.end) {
            return false;
        }
        return between({low: item.start, high: item.end}, timestamp);
    });
    if (matches.length > 1) {
        matches.sort(function(a, b) {
            return a.start > b.start;
        });
    }
    if (matches.length === 0) {
        return false;
    } else {
        return matches;
    }
}

// get all timestamps registered in the data
// object
breakpoints = function(data) {
    var points,
        start,
        end,
        i;
    points = [];
    // for each item
    for (i = 0; i < data.length; i++) {
        // check start
        start = data[i].start;
        if (points.indexOf(start) === -1) {
            points.push(start);
        }
        // check end
        end = data[i].end;
        if (points.indexOf(end) === -1) {
            points.push(end);
        }
    }
    // sort chronologically
    points.sort(function(a, b) {
        return a > b;
    });
    return points;
};

// get the breakpoints closest to a timestamp
nearest_breakpoints = function(timestamp, points) {
    var current,
        next,
        is_between,
        i;
    for (i = 0; i < points.length; i++) {
        current = points[i];
        next = points[i + 1];
        // if the timestamp is between one breakpoint and the next
        is_between = current < timestamp && timestamp < next;
        if (is_between) {
          // return both values as an object
            return {
                low: current,
                high: next
            };
        }
    }
};

validate_actions = function(actions) {
    var all_valid;
    all_valid = actions.every(function(action) {
        return typeof action.function === 'function';
    });
    return all_valid;
}

factory = function() {
    var data,
        _data,
        add_datum,
        remove_datum,
        node,
        _node,
        actions,
        _actions,
        add_action,
        now,
        extend,
        tick,
        trigger,
        api;
    actions = [];
    // get timestamp from node
    now = function() {
        return node.currentTime;
    };
    // getter/setter for bound data
    _data = function(array) {
        if (array && ! array instanceof Array) {
            console.error('bound data must be an array');
            return;
        }
        if (array) {
            data = array;
            return api;
        } else {
            return data;
        }
    };
    // getter/setter for media node
    _node = function(element) {
        if (element && typeof element.nodeName !== 'string') {
            console.error('bound node must be a valid DOM element');
            return;
        }
        if (element) {
            node = element;
            return api;
        } else {
            return node;
        }
    };
    add_action = function(new_function, start, end) {
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
    _actions = function(_) {
        var timestamp,
            timed_actions;
        if (arguments.length === 0) {
            return actions;
        } else if (arguments.length === 1) {
            if (typeof _ === 'number' || typeof _ === 'string') {
                timestamp = seconds(_);
                timed_actions = actions.filter(function(item) {
                    var both_undefined,
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
                        return between({low: item.start, high: item.end}, timestamp);
                    }
                });
                return timed_actions;
            }
        } else if (_ instanceof Array && validate_actions(_)) {
            actions = _;
        }
    };
    // add a new item to the bound data
    add_datum = function(new_data) {
        if (! data || typeof data.map !== 'function') {
            data = [];
        }
        if (new_data) {
            data = data.concat(new_data);
            return data;
        }
    };
    // remove a bound item by index
    remove_datum = function(int) {
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
    // attach an arbitrary function under a key, and pass it
    // the scoped data via arguments
    extend = function(label, bound_function) {
        if (typeof label !== 'string') {
            console.error('label must be a string');
            return;
        }
        if (typeof bound_function !== 'function') {
            console.error('extend integration requires a function');
            return;
        }
        // if we're still running, bind the function with the current values
        api[label] = function() {
            var timestamp,
                current_data;
            timestamp = now();
            current_data = api.bang(timestamp, data);
            bound_function(current_data, timestamp, node);
        }
        return api;
    };
    // run a function every time the player updates
    tick = function(breakpoints, iterator) {
        if (typeof iterator !== 'function') {
            console.error('tick integration requires a function')
            return;
        }
        if (breakpoints === true) {
            add_action(iterator);
        }
        if (breakpoints.low && breakpoints.high) {
            add_action(iterator, breakpoints.low, breakpoints.high);
        }
        return api;
    };
    // fire a function once when the trigger time is passed
    trigger = function(trigger_time, trigger_function) {
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
            var matching,
                timestamp;
            timestamp = now();
            matching = api.bang(timestamp);
            trigger_function(matching, timestamp, node);
        };
        add_action(event_handler, trigger_time, null);
        node.addEventListener(event_label, event_handler)
        tick(true, function() {
            var timestamp,
                passed;
            timestamp = now();
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
        return api;
    };
    api = {
        data: _data,
        bang: function(timestamp) {
            timestamp = timestamp || now();
            return matching_data(timestamp, data);
        },
        node: _node,
        now: now,
        seconds: seconds,
        addDatum: add_datum,
        removeDatum: remove_datum,
        actions: _actions,
        breakpoints: function() {
            return breakpoints(data);
        },
        nearestBreakpoints: function(timestamp) {
            timestamp = timestamp || now();
            return nearest_breakpoints(timestamp, breakpoints(data));
        },
        extend: extend,
        tick: tick,
        trigger: trigger,
        watch: function() {
            update(api);
            return api;
        }
    };
    return api;
};

export { factory };