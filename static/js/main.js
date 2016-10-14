var temperaturePlot
var temperatureDataset

var humidityPlot
var humidityDataset


function init(){
  var socket = io.connect('/shouts');

  console.log("connected");

  socket.on('connect', function() {
    console.log("socket connected");
  });
  socket.on('disconnect', function() {
    console.log("socket disconnected");
  });


  socket.on('sensor_data', function(data) {
    console.log(data);
    addDataPoint(temperaturePlot, temperatureDataset,data.data.temperature);
    addDataPoint(humidityPlot, humidityDataset,data.data.humidity);
  });

  plotData();

}

function plotData() {
  temperatureDataset = new vis.DataSet();
  humidityDataset = new vis.DataSet();

	temperaturePlot= initPlot("temperaturePlot")
  humidityPlot= initPlot("humidityPlot")
}

function initPlot(container_id){
	var DELAY = 1000; // delay in ms to add new data points

  var strategy = document.getElementById('strategy');

  // create a graph2d with an (currently empty) dataset
  var container = document.getElementById(container_id);
  

  var options = {
    start: vis.moment().add(-30, 'seconds'), // changed so its faster
    end: vis.moment(),
    dataAxis: {
      left: {
        range: {
          min:27, max: 29
        }
      }
    },
    drawPoints: {
      style: 'circle' // square, circle
    },
    shaded: {
      orientation: 'bottom' // top, bottom
    }
  };
  graph2d = new vis.Graph2d(container, dataset, options);


  function renderStep() {
    // move the window (you can think of different strategies).
    var now = vis.moment();
    var range = graph2d.getWindow();
    var interval = range.end - range.start;
    switch (strategy.value) {
      case 'continuous':
        // continuously move the window
        graph2d.setWindow(now - interval, now, {animation: false});
        requestAnimationFrame(renderStep);
        break;

      case 'discrete':
        graph2d.setWindow(now - interval, now, {animation: false});
        setTimeout(renderStep, DELAY);
        break;

      default: // 'static'
        // move the window 90% to the left when now is larger than the end of the window
        if (now > range.end) {
          graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
        }
        setTimeout(renderStep, DELAY);
        break;
    }
  }
  renderStep();
  return graph2d;  
}


function addDataPoint(graph2d, dataset, value) {
  // add a new data point to the dataset
  var now = vis.moment();
  dataset.add({
    x: now,
    y: value
  });

  // remove all data points which are no longer visible
  var range = graph2d.getWindow();
  var interval = range.end - range.start;
  var oldIds = dataset.getIds({
    filter: function (item) {
      return item.x < range.start - interval;
    }
  });
  dataset.remove(oldIds);
}
