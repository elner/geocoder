var site = {image_directory: 'images/'};
var geocoder;
var map;
var marker;
var label;

var image = new google.maps.MarkerImage(site.image_directory +'marker.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(20, 36),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(10, 36));
  var shadow = new google.maps.MarkerImage(site.image_directory +'marker-shadow.png',
      // The shadow image is larger in the horizontal dimension
      // while the position and offset are the same as for the main image.
      new google.maps.Size(20, 3),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 3));

// Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
 // Initialization
 this.setValues(opt_options);

 var e = document.createElement('div');
 e.id = 'size';
 e.appendChild(document.createElement('span'));

 // Label specific
 var span = this.span_ = e;

/*
 var span = this.span_ = $('<div id="size-wrapper"></div>');
span.css( {
       'position' : 'relative',
       'left' : '-50%',
       'top' : '-50%',
       'border' : '10px solid rgba(0,0,0, .2)',
       'width' : '400px',
       'height': '400px',
       'margin-top': '-205px'
     });

var div = this.div_ = $('<div id="size"></div>')

div.append(span);
*/

 /*span.style.cssText = 'position: relative; left: -50%; top: -50%; ' +
                      'white-space: nowrap; border: 10px solid rgba(0,0,0, .2); ' +
                      'width: 400px; height: 400px; margin-top: -205px';
*/
 var div = this.div_ = document.createElement('div');
 div.appendChild(span);
 div.style.cssText = 'position: absolute; display: none';

};

Label.prototype = new google.maps.OverlayView;

// Implement onAdd
Label.prototype.onAdd = function() {
 var pane = this.getPanes().overlayLayer;

 //$(pane).append(this.div_);
 pane.appendChild(this.div_);

 //Ensures the label is redrawn if the text or position is changed.
 var me = this;
 this.listeners_ = [
   google.maps.event.addListener(this, 'position_changed',
       function() { me.draw(); }),
   google.maps.event.addListener(this, 'text_changed',
       function() { me.draw(); })
 ];

};

// Implement onRemove
Label.prototype.onRemove = function() {
 this.div_.parentNode.removeChild(this.div_);

 // Label is removed from the map, stop updating its position/text.
 for (var i = 0, I = this.listeners_.length; i < I; ++i) {
   google.maps.event.removeListener(this.listeners_[i]);
 }
};

// Implement draw
Label.prototype.draw = function() {
 var projection = this.getProjection();
 var position = projection.fromLatLngToDivPixel(this.get('position'));

 var div = this.div_;
 div.style.left = position.x + 'px';
 div.style.top = position.y + 'px';
 div.style.display = 'block';

 //this.span_.innerHTML = this.get('text').toString();
};

Label.prototype.remove = function() {
  var border_width = 2;
  var width = 200;
  var height = 200;
  var margin_top = (height / 2) + border_width;

  $('#size').css( {
    'width' : width+'px',
    'height': height+'px',
    'margin-top': '-'+margin_top+'px'
  });
};


function codeAddress() {
  var address = document.getElementById("address").value;

  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {

      map.setCenter(results[0].geometry.location);
      if(marker) marker.setMap(null); // remove marker
      marker = new google.maps.Marker({
          map: map,
          title: 'Point A',
          draggable: true,
          shadow: shadow,
          icon: image,
          position: results[0].geometry.location
        });
        map.setZoom(16);

      updateMarkerPosition(results[0].geometry.location);
      updateMarkerAddress(results[0].formatted_address);
      add_event_listners();
      add_label();

    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function updateZoom(str){
  //document.getElementById('zoom-level').innerHTML = str;
  $('#size span').show().text('Zoom level '+str)
}

function updateMarkerAddress(str) {
  document.getElementById('addr').innerHTML = str;
}

function updateMarkerPosition(latLng) {
  $('#address').val('');
  document.getElementById('latitude').innerHTML = latLng.lat();
  document.getElementById('longitude').innerHTML = latLng.lng();
}

function geocodePosition(pos) {
  geocoder.geocode({
    latLng: pos
  }, function(responses) {
    if (responses && responses.length > 0) {
      updateMarkerAddress(responses[0].formatted_address);
    } else {
      updateMarkerAddress('Cannot determine address at this location.');
    }
  });
}

function add_event_listners(){
  google.maps.event.addListener(map, 'zoom_changed', function() {
    updateZoom(map.getZoom());
  });

  // Add dragging event listeners.
  google.maps.event.addListener(marker, 'dragstart', function() {
    updateMarkerAddress('Dragging...');
  });

  google.maps.event.addListener(marker, 'drag', function() {
    updateMarkerPosition(marker.getPosition());
  });

  google.maps.event.addListener(marker, 'dragend', function() {
    map.setCenter(marker.getPosition())
    geocodePosition(marker.getPosition());
  });
}

function add_label(){
  if(label == undefined){
    label = new Label({
      map: map
    });
  }
  label.bindTo('position', marker, 'position');
  label.bindTo('text', marker, 'position');
}

var MY_MAPTYPE_ID = 'hiphop';

function initialize() {

  var stylez = [
    {
      stylers: [
        { lightness: 5 },
        { gamma: 0.64 },
        { saturation: -88 }
      ]
    }
  ];

  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(51.477812,-0.001475);
  var myOptions = {
    zoom: 3,
    center: latlng,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, MY_MAPTYPE_ID]
    },
    mapTypeId: MY_MAPTYPE_ID
  }
  map = new google.maps.Map(document.getElementById("map"), myOptions);
  var styledMapOptions = {
      name: "B&W"
    };

    var jayzMapType = new google.maps.StyledMapType(stylez, styledMapOptions);

    map.mapTypes.set(MY_MAPTYPE_ID, jayzMapType);
/*
  mini_map = new google.maps.Map(document.getElementById("mini-map"), myOptions);

 var contentString = $('#mini-map').html();
 var iw = document.getElementById("mini-map")

  var infow = new google.maps.InfoWindow();
  infow.setContent(iw);
*/
  marker = new google.maps.Marker({
    position: latlng,
    title: 'Point A',
    map: map,
    shadow: shadow,
    icon: image,
    draggable: true
  });

/*
  google.maps.event.addListener(marker, 'click', function() {
    infow.open(map,marker);
  });
*/


  updateMarkerPosition(latlng);
  geocodePosition(latlng);
  updateZoom(map.getZoom());
  add_event_listners();
  add_label();
}

$(document).ready(function () {

  initialize();

  position_map();
  $(window)
    .resize(position_map);
  function position_map() {
    $("#map").height($(window).height() - $("#info-panel").height());
  }

  $('#address').val($('#address').data('placeholder'))
/*  $('#address').focus(function(){
      if ($(this).val() === $(this).data('placeholder')){
          $(this).val('');
      }
  });
*/
  $('#geocode').click(function(){
    codeAddress();
    return false;
  });

  $('#address').keyup(function(e) {
    //alert(e.keyCode);
    if(e.keyCode == 13) {
      codeAddress();
    }
    return false;
  });

  $('#update-size').click(function(){
    label.remove();
    return false;
  });

});