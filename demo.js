(function() {

  console.log('executing demo');

  var id = 'target';
  // select audio node based on target string
  var sample_node = document.getElementById(id);

  // instantiate
  var smart_podcast = extaudio()
    // set audio node
    .node(sample_node)
    // set data
    .data(sample_data);

  // execute instance
  smart_podcast();

}).call(this);
