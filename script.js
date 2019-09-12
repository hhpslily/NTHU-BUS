var map;
var directionsService;
var marker = [];
var polyLine = [];
var poly2 = [];
var startLocation = [];
var endLocation = [];
var durations = [];
var tmp = [];
var timerHandle = [];
var infoWindow = null;

var startLoc = [];
var endLoc = [];

var lastVertex = 1;
var step = 10; // 5; // metres
var eol = [];

var url = 'data/busStop.json';
var waypoints = [];
var dict = {"校門口":0, "蘇格貓底":1, "女宿":2, "人社院":3, "台積館":4, "南門停車場":5, "奕園":6};
var label = ["校門口", "蘇格貓底", "女宿", "人社院", "台積館", "南門停車場", "奕園"];
var items = ["24.795977, 120.996461", "24.794123, 120.993714", "24.791959, 120.992289", "24.789531, 120.989756", "24.786982, 120.988410", "24.785889, 120.990073", "24.788456, 120.992563"];
for (var i = 1; i < items.length-1; i++) {
    var address = items[i];
    if (address !== "") {
        waypoints.push({
            location: address,
            stopover: true
        });
    }
}

window.initialize = initialize;
window.setRoutes = setRoutes;

// called on body load
function initialize() {

    // initialize infoWindow
    infoWindow = new google.maps.InfoWindow({
        size: new google.maps.Size(150, 50)
    });
    var options = {
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: false
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), options);
}

// returns the marker
function createMarker(latlng, label, html) {
    //var contentString = '<b>' + label + '</b><br>' + html;
    // var contentString = '<b>' + label + '</b>';
    // using Marker api, marker is created
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: 10001,
        icon: "asset/bus.png"
    });
    // marker.myname = label;
    // adding click listener to open up info window when marker is clicked
    // google.maps.event.addListener(marker, 'click', function () {
    //     infoWindow.setContent(contentString);
    //     infoWindow.open(map, marker);
    // });
    return marker;
}

function createStop(latlng, label, html) {
    //var contentString = '<b>' + label + '</b><br>' + html;
    var contentString = "<div id=" + label + "><b>" + label + "</div>";
    // using Marker api, marker is created
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: 1000,
        icon: "asset/stop.png"
    });
    marker.myname = label;
    // adding click listener to open up info window when marker is clicked
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
        setInterval(function(){
            var t = dict[label];
            document.getElementById(label).innerHTML = '<b>' + label + '</b><br><b>' + tmp[t] + '鐘後抵達</b>';
        }, 500);
    });
    return marker;
}

function updateContent(i) {
    if (i != -1) 
        infoWindow.setContent(label[i+1] + "<br>" + tmp[i+1] + "鐘後抵達");
}

// Using Directions Service find the route between the starting and ending points
function setRoutes() {
    map && initialize();

    var startVal = "24.795977, 120.996461";
    var endVal = "24.788456, 120.992563";

    startLoc[0] = startVal;
    endLoc[0] = endVal;

    // empty out previous values
    startLocation = [];
    endLocation = [];
    polyLine = [];
    poly2 = [];
    timerHandle = [];

    var directionsDisplay = new Array();
    for (var i = 0; i < startLoc.length; i++) {
        var rendererOptions = {
            map: map,
            suppressMarkers: true,
            preserveViewport: true
        };
        directionsService = new google.maps.DirectionsService();
        var travelMode = google.maps.DirectionsTravelMode.WALKING;
        var request = {
            origin: startLoc[i],
            destination: endLoc[i],
            waypoints: waypoints,
            travelMode: travelMode
        };
        directionsService.route(request, makeRouteCallback(i, directionsDisplay[i]), rendererOptions);
    }
}

// called after getting route from directions service, does all the heavylifting
function makeRouteCallback(routeNum, disp, rendererOptions) {
    // check if polyline and map exists, if yes, no need to do anything else, just start the animation
    if (polyLine[routeNum] && (polyLine[routeNum].getMap() != null)) {
        startAnimation(routeNum);
        return;
    }
    return function (response, status) {

        if (status == google.maps.DirectionsStatus.OK) {
            startLocation[routeNum] = new Object();
            endLocation[routeNum] = new Object();
            // set up polyline for current route
            polyLine[routeNum] = new google.maps.Polyline({
                path: [],
                strokeColor: '#FFFF00',
                strokeWeight: 3
            });
            poly2[routeNum] = new google.maps.Polyline({
                path: [],
                strokeColor: '#FFFF00',
                strokeWeight: 3
            });
            // For each route, display summary information.
            var legs = response.routes[0].legs;
            // directionsrenderer renders the directions obtained previously by the directions service
            disp = new google.maps.DirectionsRenderer({suppressMarkers: true});
            //disp = new google.maps.DirectionsRenderer(rendererOptions);
            disp.setMap(map);
            disp.setDirections(response);

            // create Markers
            for (i = 0; i < legs.length; i++) {
                // for first marker only
                if (i == 0) {
                    startLocation[routeNum].latlng = legs[i].start_location;
                    startLocation[routeNum].address = legs[i].start_address;
                    marker[i] = createMarker(legs[i].start_location, "BUS", legs[i].start_address, "green");
                    marker[i+1] = createStop(legs[i].start_location, label[i], legs[i].start_address, "green");
                }
                endLocation[routeNum].latlng = legs[i].end_location;
                endLocation[routeNum].address = legs[i].end_address;
                marker[i+1] = createStop(legs[i].end_location, label[i+1], legs[i].end_address, "green");
                var steps = legs[i].steps;
                for (j = 0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (k = 0; k < nextSegment.length; k++) {
                        polyLine[routeNum].getPath().push(nextSegment[k]);
                    }
                }
            }
        }
        if (polyLine[routeNum]){
            // render the line to map
            polyLine[routeNum].setMap(map);
            // and start animation
            startAnimation(routeNum);
        }
    }
}

// Spawn a new polyLine every 20 vertices
function updatePoly(i, d) {
    if (poly2[i].getPath().getLength() > 20) {
        poly2[i] = new google.maps.Polyline([polyLine[i].getPath().getAt(lastVertex - 1)]);
    }

    if (polyLine[i].GetIndexAtDistance(d) < lastVertex + 2) {
        if (poly2[i].getPath().getLength() > 1) {
            poly2[i].getPath().removeAt(poly2[i].getPath().getLength() - 1)
        }
        poly2[i].getPath().insertAt(poly2[i].getPath().getLength(), polyLine[i].GetPointAtDistance(d));
    } else {
        poly2[i].getPath().insertAt(poly2[i].getPath().getLength(), endLocation[i].latlng);
    }
}


// updates marker position to make the animation and update the polyline
function animate(index, d, tick) {
    if (d > eol[index]) {
        marker[index].setPosition(endLocation[index].latlng);
        return;
    }
    var p = polyLine[index].GetPointAtDistance(d);
    marker[index].setPosition(p);
    updatePoly(index, d);
    timerHandle[index] = setTimeout("animate(" + index + "," + (d + step) + ")", tick || 1000);
    
    tmp = durations;
    durations = [];
    for(var i=0; i<items.length; i++) {
        var distanceService = new google.maps.DistanceMatrixService();
        distanceService.getDistanceMatrix({
            origins: [p],
            destinations: [items[i]],
            travelMode: google.maps.TravelMode.WALKING
        },
        function (response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                console.log('Error:', status);
            } else {
                duration = response.rows[0].elements[0].duration.text;
                durations.push(duration);
            }
        });
        console.log(tmp); 
    }
}

// start marker movement by updating marker position every 100 milliseconds i.e. tick value
function startAnimation(index) {
    if (timerHandle[index])
        clearTimeout(timerHandle[index]);
    eol[index] = polyLine[index].Distance();
    map.setCenter(polyLine[index].getPath().getAt(0));

    poly2[index] = new google.maps.Polyline({
        path: [polyLine[index].getPath().getAt(0)],
        strokeColor: "#FFFF00",
        strokeWeight: 3
    });
    timerHandle[index] = setTimeout("animate(" + index + ",50)", 2000);  // Allow time for the initial map display
}
