(function() {
  // data to be passed into the instance scope
  var sample = [
    {
      "start": 2,
      "end": 5,
      "data": {
        "image": "http://mediad.publicbroadcasting.net/p/kalw/files/99invisible-logo-itunes-badge.jpg",
        "actions": [{
          "type": "youtube",
          "url": "youtube.com/url"
        }, {
          "type": "twitter",
          "url": "twitter.com/url/tweet"
        }],
        "functions": [{
          "function_name": "name"
        }]
      }
    },
    {
      "start": 5,
      "end": 14,
      "data": {
        "image": "http://i2.wp.com/99percentinvisible.org/wp-content/uploads/2015/08/Screen-Shot-2015-08-10-at-12.05.10-PM.png",
        "actions": [{
          "type": "youtube",
          "url": "youtube.com/url"
        }, {
          "type": "twitter",
          "url": "twitter.com/url/tweet"
        }],
        "functions": [{
          "function_name": "name"
        }]
      }
    },
    {
      "start": 15,
      "end": 30,
      "data": {
        "image": "http://i2.wp.com/99percentinvisible.org/wp-content/uploads/2015/08/8712925526_bc94d59c61_h.jpg",
        "actions": [{
          "type": "youtube",
          "url": "youtube.com/url"
        }, {
          "type": "twitter",
          "url": "twitter.com/url/tweet"
        }],
        "functions": [{
          "function_name": "name"
        }]
      }
    }
  ];
  // export to window scope
  window.sample_data = sample;
}).call(this);
