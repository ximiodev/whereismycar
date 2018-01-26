var map;
var mapmini;
var marker;
var markermini;
var pictureSource;   // picture source
var geocoder = new google.maps.Geocoder;
var destinationType; // sets the format of returned value 
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
	document.addEventListener("deviceready",onDeviceReady,false);
} else {
    initMap(-34.541946, -58.491228);
    
    $('.modalVentana').animate( {top: "150px"},500 );
}

function ponerTexto(texto) {
	var parentElement = document.getElementById('contenido');
	parentElement.innerHTML = texto;
}


function initMap(lat, lng) {
	var myLatLng = {lat: lat, lng: lng};
	map = new google.maps.Map(document.getElementById('map_canvas'), {
	  center: myLatLng,
	  mapTypeControl: false,
	  streetViewControl: false,
	  zoomControl: false,
	  fullscreenControl: false,
	  zoom: 18
	});
	
	marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Estacionaste acá!'
	});
}

var onSuccessPos = function(position) {
    //~ ponerTexto('Latitude: '          + position.coords.latitude          + '\n' +
          //~ 'Longitude: '         + position.coords.longitude         + '\n' +
          //~ 'Altitude: '          + position.coords.altitude          + '\n' +
          //~ 'Accuracy: '          + position.coords.accuracy          + '\n' +
          //~ 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          //~ 'Heading: '           + position.coords.heading           + '\n' +
          //~ 'Speed: '             + position.coords.speed             + '\n' +
          //~ 'Timestamp: '         + new Date(position.timestamp)      + '\n');
          initMap(position.coords.latitude, position.coords.longitude);
};

function getCoordOfImg(img) {
	
	window.resolveLocalFileSystemURL(img,
		function(entry) {
			entry.file(function(file) {
				EXIF.getData(file, function() {
					var lat = EXIF.getTag(this, "GPSLatitude");
					var lon = EXIF.getTag(this, "GPSLongitude");

					//Convert coordinates to WGS84 decimal
					var latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";  
					var lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";  
					lat = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef == "N" ? 1 : -1);  
					lon = (lon[0] + lon[1]/60 + lon[2]/3600) * (lonRef == "W" ? -1 : 1); 
					marker.setMap(null);
					var myLatLng = {lat: lat, lng: lon};
					marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						title: 'Estacionaste acá!'
					});
				});
			}, onFail);
		},
		function(e) {
		alert('Unexpected error obtaining image file.');
		onFail(e);
	});
}

function mostrarModal(titulo, cuerpo, pie) {
	$('.modalTitulo').html(titulo);
	$('.modalCuerpo').html(cuerpo);
	$('.modalPie').html(pie);
}


function setCalle(latlng, callback) {
	geocoder.geocode({'location': latlng}, function(results, status) {
	  if (status === 'OK') {
		if (results[1]) {
		  callback(results[0].formatted_address);
		} else {
		  callback('');
		}
	  } else {
		callback('');
	  }
	});
}

function setModalCalle(nombreCa) {
	$('.infoEsta').html(nombreCa);
}

function onDeviceReady() {
	pictureSource=navigator.camera.PictureSourceType;
	destinationType=navigator.camera.DestinationType;
	navigator.geolocation.getCurrentPosition(onSuccessPos, onErrorPos);
}

function onPhotoDataSuccess(imageData) {
  var smallImage = document.getElementById('smallImage');
  smallImage.style.display = 'block';
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

function ponerPinMapa(elmapa, elmarker,lat,lng, mensaje) {
	var myLatLng = {lat: lat, lng: lng};
	
	elmarker = new google.maps.Marker({
		position: myLatLng,
		map: elmapa,
		title: mensaje
	});
}

function ponermodalPos(lat,lng) {
    $('.modalVentana').animate( {top: "150px"},500, function () {
		mapmini = new google.maps.Map(document.getElementById('captureMod'), {
		  center: {lat: lat, lng: lng},
		  disableDefaultUI: true,
		  draggable: false,
		  zoom: 18
		});
		ponerPinMapa(mapmini, markermini,lat, lng);
	} );
	var cuerpo = '<div id="captureMod"></div><div class="infoEsta"></div>';
	var pie = '<div class="botonerPie"><button onclick="mostrarCajaTexto()"><i class="fa fa-pencil" aria-hidden="true"></i></button><button onclick="guardarCurrentEst()"><i class="fa fa-map-marker" aria-hidden="true"></i></button><button onclick="ponerFotoExtra()"><i class="fa fa-camera" aria-hidden="true"></i></button></div>';
	mostrarModal('Guardar Estacionamiento', cuerpo, pie);
	setCalle({lat: lat, lng: lng}, setModalCalle)
}

function useCurrentPos() {
	var lat, lng;
	if(app) {
		navigator.geolocation.getCurrentPosition(function (position) {
			marker.setMap(null);
			ponerPinMapa(map, marker,position.coords.latitude, position.coords.longitude, 'Estacionaste acá!');
			ponermodalPos(position.coords.latitude, position.coords.longitude)
		}
		, onErrorPos);
	} else {
		if(marker) marker.setMap(null);
		ponerPinMapa(map, marker,-34.541946,-58.491228);
		ponermodalPos(-34.541946,-58.491228);
	}
}

function onPhotoFileSuccess(imageData) {
  //~ var smallImage = document.getElementById('smallImage');
  //~ smallImage.style.display = 'block';
  //~ smallImage.src = imageData;
  getCoordOfImg(imageData);
}

function capturePhotoWithFile() {
	navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}

// onError Callback receives a PositionError object
//
function onErrorPos(error) {
    alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}


function onFail(message) {
  alert('Failed because: ' + message);
}
