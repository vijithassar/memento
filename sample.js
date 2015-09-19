(function() {
  // data to be passed into the instance scope
  var sample = {
    "cuts": ["2", "5", "8", "11", "30", "39", "45"],
    "time_2":{
      "start": "2",
      "end":"33",
      "data": {
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
