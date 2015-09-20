(function() {

  console.log('executing demo');

  var get_json = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.onreadystatechange = function() {
      var status;
      var data;
      if (xhr.readyState == 4) { // `DONE`
        status = xhr.status;
        if (status == 200) {
          data = JSON.parse(xhr.responseText);
          callback(data);
        }
      }
    };
    xhr.send();
  };

  get_json('/sample.json', function(results) {
    // select audio node based on target string
    var id = 'target';
    var sample_audio = document.getElementById(id);
    // instantiate
    var smart_podcast = extaudio()
      // set audio node
      .node(sample_audio)
      // set data
      .all_data(results);
    // bind a function so it has access to the scoped data via arguments
    smart_podcast.extend('test', function(data, timestamp, node) {
      console.log('bound', data, timestamp, node)
    });
    // run the bound function on every update
    smart_podcast.tick(function(data, timestamp, node) {
      smart_podcast.test();
    });
    // execute instance
    smart_podcast();

  });

}).call(this);
