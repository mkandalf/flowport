var api_key = "AIzaSyDfRnx9l-lbFxYixN9szApP_UBvTTQHpvA";
var flow = new oflow.WebCamFlow(window.document.createElement('video'), 16);

var map;
var position = {x: 0, y: 0};

var lastT = (new Date()).getTime();
var multiplicativeFactor = 45;

var smoothed_v;

var alpha_v = .2;
var alpha_a = .1;

function deviceMotionHandler(eventData) {
  var acceleration = eventData.acceleration;
  var x_accel = acceleration.x;
  var y_accel = acceleration.y;
  document.getElementById("accel_coords").innerHTML = x_accel + " " + y_accel;
  return [x_accel, y_accel];
}

var accel;
var smoothed_a;

if (window.DeviceMotionEvent) {
  window.ondevicemotion = function(eventData) {
    var temp_accel = window.deviceMotionHandler(eventData);
    accel = {x:temp_accel[0] * 17500, y:temp_accel[1] * 17500};
  }
}

flow.onCalculated(
	function (direction) {
		if(isNaN(direction.u) || isNaN(direction.v))
			document.getElementById("x").innerHTML = "direction was not a number";
		else{
      netFlow = {x: 0, y: 0};
      var lowPassThreshold = 1;
      var numZones = 0;

      orientationBins = 9;
		  orientationDist = new Array(orientationBins);
		  orientationTotals = new Array(orientationBins);
		  for (var i = orientationDist.length-1; i >= 0; -- i){
			  orientationDist[i] = 0;
			  orientationTotals[i] = {u: 0, v: 0, n: 0};
		  }
		  orientationRange = 6.28318;
		  maxOrientationBin = 0;

      for(var i = 0; i < direction.zones.length; i++){
        if(Math.sqrt(Math.pow(direction.zones[i].u,2)+Math.pow(direction.zones[i].v,2))>lowPassThreshold){
          netFlow.x+=direction.zones[i].u;
          netFlow.y+=direction.zones[i].v;
          numZones++;

				  angleIndex = Math.floor(((Math.atan2(direction.zones[i].v, direction.zones[i].u)+Math.PI)/orientationRange)*orientationBins);

  				orientationDist[angleIndex]+=Math.sqrt(Math.sqrt(Math.pow(direction.zones[i].u,2)+Math.pow(direction.zones[i].v, 2)));
	  			orientationTotals[angleIndex].u += direction.zones[i].u;
		  		orientationTotals[angleIndex].v += direction.zones[i].v;
			  	orientationTotals[angleIndex].n += 1;
        } else {
        }
      }
      if (numZones == 0) {
        direction.u = 0;
        direction.v = 0;
      } else {
        for (var i = orientationDist.length - 1; i >= 0; i--) {
          if(orientationDist[i]>orientationDist[maxOrientationBin]){
            maxOrientationBin = i;
          }
        };
        totalN = orientationTotals[maxOrientationBin].n;
                 //+ orientationTotals[(maxOrientationBin + 1) % orientationBins].n
                 //+ orientationTotals[(maxOrientationBin - 1) % orientationBins].n;
        totalU = orientationTotals[maxOrientationBin].u;
                 //+ orientationTotals[(maxOrientationBin + 1) % orientationBins].u
                 //+ orientationTotals[(maxOrientationBin - 1) % orientationBins].u;
        totalV = orientationTotals[maxOrientationBin].v;
                 //+ orientationTotals[(maxOrientationBin + 1) % orientationBins].v
                 //+ orientationTotals[(maxOrientationBin - 1) % orientationBins].v;
        if (totalN <= 1) {
          direction.u = totalU/totalN;
          direction.v = totalV/totalN;
        }
      }

      var currentT = (new Date()).getTime();
      var deltaT = currentT - lastT;
      lastT = currentT;
      
      direction.u = -direction.u*multiplicativeFactor/(deltaT/1000);
      direction.v = direction.v*multiplicativeFactor/(deltaT/1000);
      document.getElementById("flow_coords").innerHTML = direction.u+" "+direction.v;
			if (!smoothed_v) {
				smoothed_v = {x: direction.u, y: direction.v};
			}
      if (!smoothed_a && accel) {
        smoothed_a = {x:accel.x, y:accel.y};
      }
      var old_smoothed_v = {
        x: smoothed_v.x,
        y: smoothed_v.y
      };
			smoothed_v = {
				x: alpha_v * direction.u + (1 - alpha_v) * smoothed_v.x,
				y: alpha_v * direction.v + (1 - alpha_v) * smoothed_v.y
			};
      smoothed_a = {
        x: alpha_a * accel.x + (1 - alpha_a) * smoothed_a.x,
        y: alpha_a * accel.y + (1 - alpha_a) * smoothed_a.y
      };
      
      var integrated_v = {
        x: old_smoothed_v.x + smoothed_a.x*deltaT/1000,
        y: old_smoothed_v.y + smoothed_a.y*deltaT/1000
      };
      
      var flow_weight = 1;
      smoothed_v.x = flow_weight * smoothed_v.x + (1 - flow_weight) * integrated_v.x;
      smoothed_v.y = flow_weight * smoothed_v.y + (1 - flow_weight) * integrated_v.y;
      document.getElementById("x").innerHTML = smoothed_v.x + "\n" + integrated_v.x;
      document.getElementById("y").innerHTML = smoothed_v.y + "\n" + integrated_v.y;

      position.x += smoothed_v.x*(deltaT/1000);
      position.y += smoothed_v.y*(deltaT/1000);
      //document.getElementById("x").innerHTML = position.x;
      //document.getElementById("y").innerHTML = position.y;
      //document.getElementById("image").style.backgroundPosition = position.x+" "+position.y;
      map.panBy(-smoothed_v.x*(deltaT/1000), -smoothed_v.y*(deltaT/1000));
		}
	}
);

function initialize() {
  var mapOptions = {
    center: { lat: -34.397, lng: 150.644},
    zoom: 8
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);

flow.startCapture();
