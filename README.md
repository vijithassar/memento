# memento.js #

momentary data binding along a timeline for HTML5 media

![clock](./header.png)

# Overview #

memento.js binds data to regions of audio or video and allows you to quickly recall the results at any point during playback or scrubbing. Calling the .data() method on a memento object will retrieve the data corresponding to that point in time. Calling the .data() method repeatedly at different points in time will retrieve different data.

Conceptually, memento can be thought of as a way to slave all JavaScript execution to the playback as defined by the bound media node. It doesn't meaningfully use JavaScript events, though. Instead, it wraps around a playable media node and a queryable data structure, and then uses timing information from the former to deliver dynamic data payloads from the latter that automatically change over time.

[video demo](https://twitter.com/lamthuyvo/status/645688414675828737)

# Data #

memento binds arrays. Each item in the array must have "start" and "end" properties in order to be recalled at the proper time. It doesn't necessarily have to be a hashmap, though – you can bind an array of anything else (strings, numbers, arrays, nulls, etc) as long as you define "start" and "end" as additional properties on the item first.

```javascript
// fruits with corresponding ranges
var data = [
  {start: 1, end: 7, data: "banana"},
  {start: 8, end: 12, data: "apple"},
  {start: 10, end: 22, data: "pineapple"},
  {start: 25, end: 35, data: "orange"}
];
```

Data cannot be bound to a point, only to a range. Binding data to an exact point in time would be incompatible with our reality, in which a point is considered mathematically infinitesimal and thus the data would never actually be available for extraction during script execution. With that said, you are free to make your bound range as small as JavaScript float precision allows, and/or use the memento.trigger() integration to act once on a specific piece of data.

# Timestamps #

Internally, memento represents all timestamps as numerical integers and floats representing elapsed seconds. However, it can also accept timestamps as a string, in DD:HH:MM:SS format. Partial seconds are allowed in this string timestamp format. Unused time elements can be omitted from the string timestamps, so "1:30" will translate to 90 seconds.

```javascript
// bind a data set which uses both strings and integers
var data = [
  {start: 1, end: 7, data: "banana"},
  {start: "0:08", end: "0:12", data: "apple"},
  {start: 10, end: 22, data: "pineapple"},
  {start: 25, end: "0:35", data: "orange"}
];
```

**memento.seconds()** is available as a helper function which will convert string timestamps into numbers. It takes a single argument, which should be a string representing the timestamp. If the argument supplied is a number, it will be transparently returned.

# Setup #

First, instantiate a memento object by running the memento() function factory, which returns a function instance.

```javascript
// create a memento instance
var project = memento();
```

Use the .node() method to bind that object to an HTML5 media element.

```javascript
// select audio node
var audio = document.getElementById('target-audio');
// bind audio to memento object
project.node(audio);
```

Bind the data using the .all_data() method.

```javascript
// fetch data however you wish
var data = get_data();
// bind all data to memento object
project.all_data(data);
```

Now, as you play or scrub the audio, you can retrieve the matching data for time ranges which overlap the current playback position by calling the .data() method on the memento object.

```javascript
// retrieve all data bound to the current timestamp
var current_data = project.data();
```

The return value of the .data() method will be a boolean false if there is no data bound to ranges overlapping the current timestamp. If there is matching data, the return value of the .data() method will be an *array* of all matching data elements from the input array. This means that multiple matching data elements can overlap on a particular time position, but it also means you may need to navigate around an array even if you only expect one result.

The .data() method can also take an optional timestamp in string or numerical format to retrieve data for a playback position other than the current one.

```javascript
// get bound data for thirty seconds in
var thirty_second_data = smart_audio.data(30);
```

# Basic Functionality #

Most basic functionality in memento deals with setting up the data binds or retrieving data at a particular point.

- **memento.node()** sets the bound media or retrieves the existing bound media. When used as a setter, it takes one argument, which should be a DOM element for an HTML5 audio or video node.
- **memento.all_data()** sets the bound data or retrieves the existing bound data. When used as a setter, it takes one argument, which should be an array of data items. When used as a getter, it returns all data, ignoring relevance to the current playback timestamp. Remember that data items must contain properties for "start" and "end" in order to be matched to a particular range. Bound data items without those keys will be stored in scope but will not be accessible using the .data() method, and for the most part will be ignored. This behavior can be useful in cases where you want to bind data initially but don't have all the timestamp information yet.
- **memento.data()** retrieves an array of all data elements whose ranges overlap the current playback position. It can optionally take a single argument, a timestamp in numerical or string format.
- **memento.timestamp()** retrieves a number representing the current playback position in seconds.

# Integrations #

memento provides a number of ways with which to expose its internal information to your custom functions. You should of course feel free to augment any memento instance through the use of timeouts, intervals, events, or direct addition of new methods. The primary benefit of using the integrations is that they pass the data, timestamp, and media node from memento's internal scope into the new function via arguments.


Functions that use these integrations are stored as an array of registered functions which is itself saved on the memento instance object. In order to fire integrated functions, you'll need to call the memento instance function in order to get it to start watching the media node timestamp updates.

```javascript
// fire the instance function, allowing
// integrated functions to execute
project();
```

Basic functionality can be used without calling the instance.

### Extend ###

**memento.extend()** integrates a new function with the current memento object such that it can be *called whenever desired* elsewhere in the script. It takes two arguments: the first is a string that will be used as the name of the new bound method, and the second is a function that will execute when called by that method key. The extension function in turn takes three arguments: the currently bound data, the current timestamp, and the media node.

```javascript
// add a new logging function

// create a memento instance
var project = memento();

// define a custom function that takes the three
// integration arguments
var my_new_function = function(data, timestamp, node) {
  // do whatever you want in here
  console.log('logging when method is called:', data, timestamp, node);
}

// bind it to the memento instance under the method
// name .logger()
project.extend('logger', my_new_function);

// call the new logging function
project.logger();
```

### Tick ###

**memento.tick()** integrates a new function with the current memento object such that it will be *called continuously* by the player. It takes two arguments. The first is either an object containing breakpoints in between the ticking will be enabled, or else a boolean true to enable ticking at all times. The second argument is a function which will be fired every time the current time is updated by the player. The ticking function in turn takes three arguments: the currently bound data, the current timestamp, and the media node.

```javascript
// tick a logging function constantly

// create a memento instance
var project = memento();
// fire the callback function whenever the player updates
project.tick(true, function(data, timestamp, node) {
  // do whatever you want in here  
  console.log('logging on every update:', data, timestamp, node);
});
```

In this case the breakpoints represent a time range just like those from the data bind, which use the notation "start" and "end," but breakpoints use the slightly different semantics "low" and "high" to account for internal cases where the higher breakpoint is not an ending – for example, when representing the current data bind state, the "high" key in the breakpoints object might actually correspond to the "start" time of a new upcoming bound data item.

As with most other memento time values, breakpoints can be provided as integers, floats, or strings.

```javascript
// tick a logging function between 30 seconds and 45 seconds

// create a memento instance
var project = memento();
// define breakpoints
var breakpoints = {low: 30, high: "0:45"};
// fire the callback function whenever the player updates if it's between breakpoints
project.tick(breakpoints, function(data, timestamp, node) {
  // do whatever you want in here  
  console.log('logging on every update:', data, timestamp, node);
});
```

### Trigger ###

**memento.trigger()** integrates a new function with the current memento object such that it will be *called once* at a particular moment in time. It takes two arguments: the first is a timestamp, and the second is the function to be fired. The triggered function in turn takes three arguments: for the currently bound data, the current timestamp, and the media node.

```javascript
// fire a logging function at 90 seconds

// create a memento instance
var project = memento();
// fire the callback function whenever the player updates
project.trigger('1:30', function(data, timestamp, node) {
  // do whatever you want in here  
  console.log('logging at 90 seconds:', data, timestamp, node);
});
```

The .trigger() integration is the only memento feature that uses JavaScript events. The bound audio node is used as the element for the listener. The listener is also added to the internal array of registered functions, but this is only a formality which provides predictable registration behavior alongside the integrations that don't use events, and it has no meaningful effect on functionality. Triggered functions only have a start value when internally registered, and the end value is undefined.

The precise moment of execution for a triggered function may vary somewhat. The media node updates the page as playback progresses, but it doesn't do so on every audio or video frame; the specific rate at which the updates occur may vary. As such, memento can't always expect an update to occur at the exact moment for which a trigger was registered. Instead, it compares the current playback time to the registered trigger timestamp, and will fire the function if that threshold has been passed.
