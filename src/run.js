var flow = new oflow.WebCamFlow(window.document.createElement('video'), 32);
//var flow = new oflow.WebCamFlow();

var position = {x: 0, y: 0};

var lastT = (new Date()).getTime();
var multiplicativeFactor = 0.1;

var smoothed;

var alpha = 0.5;


flow.onCalculated(
	function (direction) {
		if (!smoothed) {
			smoothed = {u: direction.u, v: direction.v};
		}
		smoothed = {
			u: alpha * direction.u + (1 - alpha) * smoothed.u,
			v: alpha * direction.v + (1 - alpha) * smoothed.v
		};
	    console.log(JSON.stringify(direction, null, 4));
	    var currentT = (new Date()).getTime();
	    var deltaT = currentT - lastT;
	    position.x += smoothed.u*deltaT/1000*multiplicativeFactor;
	    position.y += smoothed.v*deltaT/1000*multiplicativeFactor;
	    document.getElementById("x").innerHTML = position.x;
	    document.getElementById("y").innerHTML = position.y;
	    document.getElementById("image").style.backgroundPosition = position.x+" "+position.y;
	}
);

flow.startCapture();
