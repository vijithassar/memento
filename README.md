# memento.js #

momentary data binding along a timeline for HTML5 media

# Overview #

memento.js binds data to regions of audio or video and allows you to quickly recall the results at any point during playback or scrubbing. Calling the .data() method on a memento object will retrieve the data corresponding to that point in time. Calling the .data() method repeatedly at different points in time will retrieve different data.

# Data #

Memento binds with arrays. Each object must have "start" and "end" properties in order to be recalled at the proper time. Each item doesn't necessarily have to be a hashmap, though – you can bind an array of anything else (strings, numbers, arrays, nulls, etc) as long as you define "start" and "end" as additional properties on the item.

```javascript
// fruits with corresponding ranges
var data = [
  {start: 1, end: 7, data: "banana"}
  {start: 8, end: 12, data: "apple"}
  {start: 10, end: 22, data: "pineapple"}
  {start: 25, end: 35, data: "orange"}
]
```

Start and end times can be given either as integers or decimals representing a number of seconds, or alternatively as strings using DD:HH:MM:SS format. You can omit units you aren't actually using, so "1:30" translates into 90 seconds

```javascript
// bind with both strings and integers
var data = [
  {start: 1, end: 7, data: "banana"}
  {start: "0:08", end: "0:12", data: "apple"}
  {start: 10, end: 22, data: "pineapple"}
  {start: 25, end: "0:35", data: "orange"}
];
```

# Setup #

First, instantiate a memento object.

```javascript
var smart_audio = memento();
```

Use the .node() method to bind that object to an HTML5 media player.

```javascript
// select audio node
var audio = document.getElementById('target-audio');
// bind audio to memento object
smart_audio.node(audio);
```
Bind the data using the .all_data() method.

```javascript
// fetch data however you wish
var data_set = get_data();
// bind all data to memento object
smart_audio.all_data(data_set);
```

Now, as you play or scrub the audio, you can retrieve the matching data for time ranges which overlap the current playback position by calling the .data() method on the memento object.

```javascript
// retrieve all data bound to the current timestamp
var current_data = smart_audio.data();
```

This will be an *array* of all matching data elements from the input array; this means that multiple matching data elements can overlap on a particular time position, but it also means you may need to navigate around an array even if you only expect one result.

The .data() method can also take an optional timestamp in string or numerical format to retrieve data for a playback position other than the current one.

```javascript
// get bound data for thirty seconds in
var thirty_second_data = smart_audio.data(30);
```

# Core API #

memento provides additional functionality for exposing data, timestamps, and audio from its internal scope so you can act on it using your own functions.

- **memento.node()** gets or sets the bound media. When used as a setter, it takes one argument, which should be a DOM element for an HTML5 audio or video node.
- **memento.all_data()** gets or sets all bound data, ignoring relevance to the current playback timestamp. When used as a setter, it takes one argument, which should be an array of data items. Remember that data items must contain properties for "start" and "end" in order to be matched to a particular range. Bound data items without will be stored in scope but will not be accessible using the .data() method, and for the most part will be ignored.
- **memento.data()** retrieves an array of all data elements whose ranges overlap the current playback position. It can optionally take a single argument, a timestamp which can be an integer, float, or a string in "DD:HH:MM:SS" format. You can omit units you aren't actually using, so "1:30" translates into 90 seconds.
- **memento.timestamp()** retrieves a number representing the current playback position in seconds.
- **memento.seconds()** is a helper method which converts timestamps from strings in format "DD:HH:MM:SS" into an integer representing the number of seconds. It takes that string as its only argument, but if passed a number will transparently return it.

# Integrations #

memento provides a number of ways with which to expose its internal data, timestamp, and media node information to your custom functions.

**memento.extend()** binds your new function to the current memento object. It takes two arguments: the first is a string that will be used as the name of the new bound method, and the second is a function that will execute. That function can in turn take three arguments – current data, current timestamp, and media node – after which you can do whatever else you want with them.

```javascript
// create a memento instance
var project = memento();

// define a custom function that takes the three
// binding arguments for current data, timestamp,
// and media node
var my_new_function = function(data, timestamp, node) {
  // do whatever you want in here
  console.log('logging when fired:', data, timestamp, node);
}
// bind it to the memento instance under the method
// name .logger()
project.extend('logger', my_new_function);
```

**memento.tick()** takes one argument, a function, and fires it every time the current time is updated by the player. The ticking function in turn takes three arguments, for the currently bound data, the current timestamp, and the media node.

```javascript
// create a memento instance
var project = memento();
project.tick(function(data, timestamp, node) {
  // do whatever you want in here  
  console.log('logging on every update:', data, timestamp, node)
});
```
