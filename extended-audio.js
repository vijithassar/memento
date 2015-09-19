(function() {

  console.log('setting up extended audio functionality');

  // function factory
  var extaudio = function() {
    // return value of the factory function
    var func = function() {
      // calling the function will just call its own execution
      // methods, if they exist
      if (typeof func.execute === 'function') {
        func.execute();
      }
    }
    // getter/setter for bound data
    var data;
    func.data = function(obj) {
      if (obj) {
        data = obj;
        return func;
      } else {
        return data;
      }
    }
    // getter/setter for node
    var node;
    func.node = function(element) {
      if (element) {
        node = element;
        return func;
      } else {
        return node;
      }
    }
    // attach an arbitrary function under a key, and pass it
    // the scoped data via arguments
    func.bind_function = function(label, bound_function) {
      var current_data, timestamp;
      if (typeof label !== 'string') {
        return;
      }
      current_data = this.get_current_data();
      timestamp = node.currentTime;
      func[label] = bound_function(current_data, timestamp, node);
    }
    // get data
    func.get_current_data = function(event) {
      var id, current_data;
      id = 'time_' + event;
      current_data = data[id];
      return current_data;
    }
    // run all functionality
    func.execute = function() {
      var currEvt = -1;
      var prevEvt = -1;
      node.ontimeupdate = function(){
        //console.log(node.currentTime);
        var time = node.currentTime;
        var rounded = Math.round(time);

        for (var i=0; i<data.cuts.length; i++){
          if (data.cuts[i] == rounded){
            if (currEvt != prevEvt) {
              func.get_current_data(currEvt);
              prevEvt = currEvt;
            }
            currEvt = rounded;
          }
        }
      }

    }
    // return results of the factory
    return func;
  }

  // attach factory to global space
  window.extaudio = extaudio;

}).call(this);
