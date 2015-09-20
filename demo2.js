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

  get_json('/static/podcast.json', function(results) {
    // select audio node based on target string
    var id = 'target';
    var sample_audio = document.getElementById(id);
    // instantiate
    var smart_podcast = extaudio()
      // set audio node
      .node(sample_audio)
      // set data
      .all_data(results);

    smart_podcast.extend('run', function(data, timestamp, node){
      // get the data that we want.
      for (timeobj in data) {
        start =  parseInt(data[timeobj].start);
        end = parseInt(data[timeobj].end);
        if (!done_time[start]) {
          done_time[start] = true;

          timeobj_data = data[timeobj].data;
          actions =  timeobj_data.actions;

          var image_url = timeobj_data.image;
          // if the current time object has an actions option...
          if (actions) {
            for (num in actions) {
              action = actions[num];
              switch(action.type) {
                case "map":
                  initialize(action.url,3)
                  break;
                case "twitter":
                  action.url.forEach(function (url) {
                      embed_tweet(url,end-start);
                  });
                  break;
                case "vine":
                  embed_vine(action.url, 10)
                  break;
              }
            }
          }
          if (image_url){
            initImage(image_url);
          }

        }
      }
    });

    function initialize(latLng, sleep_time) {
        latLng = latLng.split(",")
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])},
          zoom: 7
        });
        setTimeout(function()
          {
            $("#map").empty().removeAttr('style');
          }, sleep_time * 1000);
    }

    function embed_tweet(tweet_url, sleep_time) {
        $.ajax({
          type: 'GET',
          url: "https://api.twitter.com/1/statuses/oembed.json?url=" + encodeURI(tweet_url),
          dataType: "jsonp",
          success: function(data) {
            $("#twitter").append(data.html);
            twttr.widgets.load($("#twitter"));
            setTimeout(function() {
                $("#twitter").empty();
            }, sleep_time * 1000);
          }
        });
    }

    function embed_vine(url, sleep_time) {
      $.ajax({
        async: false,
        type: 'GET',
        url: "https://vine.co/oembed.json?url=" + url,
        success: function(data) {
          console.log("appending vine data");
          $("#vine").append(data.html)
        }
      });
      setTimeout(function()
        {
          $("#vine").empty();
        }, sleep_time * 1000);
    }

    function initImage(url){
      // for now, just change the background image
      $('body').css('background-image', 'url(' + url + ')');
    }

    $('.popup').click(function(){
      $('.popup').attr('style', '');
      $(this).css('z-index', 200)
    })

    // run the bound function on every update
    smart_podcast.tick(function(data, timestamp, node) {
      smart_podcast.run();
    });
    // execute instance
    smart_podcast();

  });

}).call(this);
