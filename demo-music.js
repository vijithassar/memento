(function() {

  console.log('executing demo');

  var get_json = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.onreadystatechange = function() {
      var status;
      var data;
      if (xhr.readyState === 4) {
        status = xhr.status;
        if (status === 200) {
          data = JSON.parse(xhr.responseText);
          callback(data);
        }
      }
    };
    xhr.send();
  };

  var api_token = 'UdWMZbV5maoJaLEh1hZ0eHLCTeYYTSVfFmpcCfsi-g7r6o46rwa8sK1v826LzyPj'
  var song_id = 1376;
  var format = '&text_format=html';

  var get_song_data_url = function() {
    var endpoint, url;
    endpoint = 'http://api.genius.com/songs/'
    url = endpoint + song_id + '?access_token=' + api_token + format
    return url;
  }
  var get_annotation_data_url = function() {
    var endpoint, param, url;
    endpoint = 'http://api.genius.com/referents';
    param = '?song_id='
    url = endpoint + param + song_id + '&access_token=' + api_token + format;
    return url;
  }
  var song_data_url = get_song_data_url();
  var annotation_data_url = get_annotation_data_url();

  get_json(song_data_url, function(song_data) {

    get_json(annotation_data_url, function(annotation_data) {

      var genius_data = {
        song: song_data.response.song,
        annotations: annotation_data.response.referents,
      }

      // select audio node based on target string
      var id = 'target';
      var sample_audio = document.getElementById(id);

      // instantiate
      var smart_podcast = memento()
        // set audio node
        .node(sample_audio)
        // set data
        .all_data(genius_data.annotations);

      // bind a function so it has access to the scoped data via arguments
      smart_podcast.extend('test', function(data, timestamp, node) {
        console.log('bound', data, timestamp, node);
      });

      // trigger a function when a particular timestamp is passed
      smart_podcast.trigger(2, function(data, timestamp, node) {
        console.log('triggered!', data, timestamp, node);
      });

      // run the bound function on every update
      smart_podcast.tick(function(data, timestamp, node) {
        smart_podcast.test();
      });

      // execute instance
      smart_podcast();

    });

  });

}).call(this);
