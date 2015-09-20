(function() {
  // data to be passed into the instance scope
  var sample = {
    "time_2":{
      "start": "2",
      "end":"14",
      "data": {
        "image" : "http://mediad.publicbroadcasting.net/p/kalw/files/99invisible-logo-itunes-badge.jpg",
        "actions" : [
          {
            "type":"youtube",
            "url": "youtube.com/url"
          },
          {
            "type":"twitter",
            "url":"twitter.com/url/tweet"
          }
        ],
        "functions":[
            {
              "function_name":"name"
            }
        ]
      }
    },
       "time_2":{
      "start": "15",
      "end":"30",
      "data": {
        "image" : "http://i2.wp.com/99percentinvisible.org/wp-content/uploads/2015/08/8712925526_bc94d59c61_h.jpg",
        "actions" : [
          {
            "type":"youtube",
            "url": "youtube.com/url"
          },
          {
            "type":"twitter",
            "url":"twitter.com/url/tweet"
          }
        ],
        "functions":[
            {
              "function_name":"name"
            }
        ]
      }
    }
  };
  // export to window scope
  window.sample_data = sample;
}).call(this);
