var flow = new oflow.WebCamFlow(window.document.createElement('video'), 32);
//var flow = new oflow.WebCamFlow();

var position = {x: 0, y: 0};

var lastT = (new Date()).getTime();
var multiplicativeFactor = 0.001;

var lastVelocity;

var alpha = 0.5;


flow.onCalculated(
	function (direction) {
		if (!lastVelocity) {
			lastVelocity = {u: direction.u, v: direction.v};
		}
		var smoothedU = alpha * direction.u + (1 - alpha) * lastVelocity.u;
		var smoothedV = alpha * direction.v + (1 - alpha) * lastVelocity.v;
		lastVelocity = {u : smoothedU, v: smoothedV};
	    console.log(JSON.stringify(direction, null, 4));
	    var currentT = (new Date()).getTime();
	    var deltaT = currentT - lastT;
	    position.x += direction.u*deltaT/1000*multiplicativeFactor;
	    position.y += direction.v*deltaT/1000*multiplicativeFactor;
	    document.getElementById("x").innerHTML = position.x;
	    document.getElementById("y").innerHTML = position.y;
	}
);

flow.startCapture();
