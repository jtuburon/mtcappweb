var temperaturePlot
var temperatureDataset

var humidityPlot
var humidityDataset

var humidityRange;
var temperatureRange;


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
    addDataPoint(temperaturePlot, temperatureDataset, data.data.temperature);
    addDataPoint(humidityPlot, humidityDataset, data.data.humidity);
  });

  plotData();

}

function plotData() {
  temperatureDataset = new vis.DataSet();
  humidityDataset = new vis.DataSet();

	temperaturePlot= initPlot("temperaturePlot", temperatureDataset)
  humidityPlot= initPlot("humidityPlot", humidityDataset)
}

function initPlot(container_id, dataset){
	var DELAY = 1000; // delay in ms to add new data points

  var strategy = document.getElementById('strategy');

  // create a graph2d with an (currently empty) dataset
  var container = document.getElementById(container_id);
  
  if(container_id=="temperaturePlot"){
    range= {
      min:10, max: 32
    }
    humidityRange= range
  }else if(container_id=="humidityPlot"){
    range= {
      min:0, max: 40
    } 
    temperatureRange= range
  }else{
    range= {
      min:0, max: 100
    } 
  }

  var options = {
    start: vis.moment().add(-30, 'seconds'), // changed so its faster
    end: vis.moment(),
    dataAxis: {
      left: {
        range: range
      }
    },
    drawPoints: {
      style: 'circle' // square, circle
    },
    shaded: {
      orientation: 'bottom' // top, bottom
    }
  };
  var graph2d = new vis.Graph2d(container, dataset, options);

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
  
  if(temperatureDataset==dataset){
    temperatureRange.min = temperatureDataset.min("y").y - 0.5;
    temperatureRange.max = temperatureDataset.max("y").y + 0.5;
    range= temperatureRange;
  }else if(humidityDataset==dataset){
    humidityRange.min = humidityDataset.min("y").y - 0.5;
    humidityRange.max = humidityDataset.max("y").y + 0.5;
    range= humidityRange;
  }

  var options = {
    start: vis.moment().add(-30, 'seconds'), // changed so its faster
    end: vis.moment(),
    dataAxis: {
      left: {
        range: range
      }
    },
    drawPoints: {
      style: 'circle' // square, circle
    },
    shaded: {
      orientation: 'bottom' // top, bottom
    }
  };
  graph2d.setOptions(options);
}
