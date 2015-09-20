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

  var done_time = {} ;

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

    smart_podcast.extend('map', function(data, timestamp, node){
      // get the data that we want.
      for (timeobj in data) {
        start =  parseInt(data[timeobj].start);
        end = parseInt(data[timeobj].end);
        if (!done_time[start]) {
          done_time[start] = true;

          timeobj_data = data[timeobj].data;
          actions =  timeobj_data.actions;
          // if the current time object has an actions option...
          if (actions) {
            for (num in actions) {
              action = actions[num];
              switch(action.type) {
                case "map":
                  initialize(action.url,3)
                  break;
                case "twitter":
                  show_tweet(action.url,end-start)
                  break;
              }
            }
          }
        }
      }
    });

    function initialize(latLng, sleep_time) {
        latLng = latLng.split(",")
        $("#content").html("<div id='map'></div>");
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])},
          zoom: 7
        });
        setTimeout(function()
          {
            $("#map").empty();
          }, sleep_time * 1000);
    }

    function show_tweet(tweet_url, sleep_time) {
        $.ajax({
          url: "https://api.twitter.com/1/statuses/oembed.json?url=" + encodeURI(tweet_url),
          dataType: "jsonp",
          success: function(data) {
            $("#content").html("<div id='twitter'></div>");
            $("#twitter").html(data.html);
            twttr.widgets.load($("#twitter"));
            setTimeout(function() {
                $("#twitter").remove();
            }, sleep_time * 1000);
          }
        });
    }

    // run the bound function on every update
    smart_podcast.tick(function(data, timestamp, node) {
      smart_podcast.map();
    });
    // execute instance
    smart_podcast();

  });

}).call(this);
