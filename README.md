# memento.js #

momentary data binding along a timeline for HTML5 media

# Overview #

memento.js binds data to regions of audio or video and allows you to quickly recall the results at any point during playback or scrubbing. Calling the .data() method on a memento object will retrieve the data corresponding to that point in time. Calling the .data() method repeatedly at different points in time will retrieve different data.

# Data #

Memento binds arrays of objects. Each object must have "start" and "end" properties in order to be recalled at the proper time.

```javascript

// fruits with corresponding ranges
var data = [
  {start: 1, end: 7, data: "banana"}
  {start: 8, end: 12, data: "apple"}
  {start: 10, end: 22, data: "pineapple"}
  {start: 25, end: 35, data: "orange"}
]

```

Start and end times can be given either as integers or decimals representing a number of seconds, or alternatively as strings using DD:HH:MM:SS format.

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
