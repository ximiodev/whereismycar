var map;
var mapmini;
var marker;
var markermini;
var lastPosition = {};
var pictureSource;   // picture source
var geocoder;
var directionsService;
var directionsDisplay;
var destinationType; // sets the format of returned value 

var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

if (app) {
	document.addEventListener("deviceready",onDeviceReady,false);
}


function onDeviceReady() {
	pictureSource=navigator.camera.PictureSourceType;
	destinationType=navigator.camera.DestinationType;
	
	if(window.localStorage.getItem('ultimoest')!='' && window.localStorage.getItem('ultimoest')!=null) {
		lastPosition = JSON.parse(window.localStorage.getItem('ultimoest'));
	}
	
	navigator.geolocation.getCurrentPosition(onSuccessPos, onErrorPos);
	initMap();
}


var onSuccessPos = function(position) {
	initMapa(position.coords.latitude, position.coords.longitude);
	lastPosition['lat'] = position.coords.latitude;
	lastPosition['lng'] = position.coords.longitude;
};

var inicioSinLoc = function() {
    initMapa(-34.541946, -58.491228);
		
	if(window.localStorage.getItem('ultimoest')!='' && window.localStorage.getItem('ultimoest')!=null) {
		lastPosition = JSON.parse(window.localStorage.getItem('ultimoest'));
	}
};

function initMap() {
	geocoder = new google.maps.Geocoder;
	directionsService = new google.maps.DirectionsService;
	directionsDisplay = new google.maps.DirectionsRenderer;
}

function placeMarker(location) {
	if(marker) marker.setMap(null);
	
	lastPosition['lat'] = location.lat;
	lastPosition['lng'] = location.lng;
    marker = new google.maps.Marker({
        position: location, 
        map: map,
		title: 'Estacionaste acá!'
    });
}

function initMapa(lat, lng) {
	var myLatLng = {lat: lat, lng: lng};
	map = new google.maps.Map(document.getElementById('map_canvas'), {
	  center: myLatLng,
	  mapTypeControl: false,
	  streetViewControl: false,
	  zoomControl: false,
	  fullscreenControl: false,
	  zoom: 18
	});
	
	google.maps.event.addListener(map, 'click', function(event) {
	   placeMarker(event.latLng);
	});
	directionsDisplay.setMap(map);
	
	marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Estacionaste acá!'
	});
	
	
	var count = 0;
	for (var k in lastPosition) {
		if (lastPosition.hasOwnProperty(k)) {
		   ++count;
		}
	}
	if(count>0) {
		mostrarControlesBuscar();
	} else {
		mostrarControlesNuevo();
	}
}

function getCoordOfImg(img) {
	lastPosition['img'] = img;
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
					
					try {
						if(marker) marker.setMap(null);
					
						var myLatLng = {lat: lat, lng: lon};
						lastPosition['lat'] = lat;
						lastPosition['lng'] = lon;
						ponermodalPos(lat,lon);
						marker = new google.maps.Marker({
							position: myLatLng,
							map: map,
							title: 'Estacionaste acá!'
						});
					} catch(e) {
						alert(e.message);
					}
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
	lastPosition['Calle'] = nombreCa;
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

function guardarNotasExtra() {
    lastPosition['notasExtra'] = $('#textoextra').val();
    $('.notasExtra').html(lastPosition['notasExtra']);
    $('.ventanaparatexto').animate( {left: "-105%"},300);
}

function mostrarCajaTexto() {
    $('.ventanaparatexto').animate( {left: "5%"},500);
}

function cerrarModal(quien) {
   $(quien).animate( {top: "-120vh"},300);
}

function ponermodalPos(lat,lng) {
	var cuerpo = '<div id="captureMod"></div><div class="infoEsta"></div><div class="notasExtra"></div><div class="fotoExtra"></div><div class="ventanaparatexto"><textarea id="textoextra"></textarea><buton class="butonGenerico" onclick="guardarNotasExtra()">Guardar</button></div>';
	var pie = '<div class="botonerPie"><button onclick="mostrarCajaTexto()"><i class="fa fa-pencil" aria-hidden="true"></i></button><button onclick="guardarCurrentEst()"><i class="fa fa-map-marker" aria-hidden="true"></i></button><button onclick="ponerFotoExtra()"><i class="fa fa-camera" aria-hidden="true"></i></button></div>';
	mostrarModal('Guardar Estacionamiento <button onclick="cerrarModal(\'.modalVentana\')" class="butonClose"><i class="fa fa-times" aria-hidden="true"></i></button>', cuerpo, pie);
    $('.modalVentana').animate( {top: "150px"},500, function () {
		$('#captureMod').html('');
		mapmini = new google.maps.Map(document.getElementById('captureMod'), {
		  center: {lat: lat, lng: lng},
		  disableDefaultUI: true,
		  draggable: false,
		  zoom: 18
		});
		ponerPinMapa(mapmini, markermini,lat, lng);
	} );
	setCalle({lat: lat, lng: lng}, setModalCalle);
	if(lastPosition['img']) ponerMiniFotoExtra(lastPosition['img']);
	lastPosition['lat'] = lat;
	lastPosition['lng'] = lng;
}

function guardarCurrentEst() {
	window.localStorage.setItem('ultimoest', JSON.stringify(lastPosition));
	ocultarControlesNuevo();
	mostrarControlesBuscar();
	cerrarModal('.modalVentana');
}

function ocultarControlesNuevo() {
	$('#usePosition').animate( {bottom: "-250px"},500);
	$('#takePhotoPos').animate( {bottom: "-100px"},500);
}

function mostrarControlesNuevo() {
	$('#usePosition').animate( {bottom: "20px"},500);
	$('#takePhotoPos').animate( {bottom: "40px"},500);
}

function ocultarControlesBuscar() {
	$('#findCar').animate( {bottom: "-250px"},500);
	$('#discardEst').animate( {bottom: "-100px"},500);
}

function mostrarControlesBuscar() {
	$('#findCar').animate( {bottom: "20px"},500);
	$('#discardEst').animate( {bottom: "40px"},500);
}

function findCar() {
	//~ directionsDisplay.setMap(null);
	if(marker) marker.setMap(null);
	//~ directionsDisplay.setMap(map);
	directionsDisplay.setMap(map);
	navigator.geolocation.getCurrentPosition(function (position) {
		if(marker) marker.setMap(null);
		directionsService.route({
		  origin: ''+position.coords.latitude+','+position.coords.longitude,
		  destination: ''+lastPosition['lat']+','+lastPosition['lng'],
		  optimizeWaypoints: true,
		  travelMode: 'WALKING'
		}, function(response, status) {
		  if (status === 'OK') {
			  
			try {
				directionsDisplay.setDirections(response);
			} catch(e) {
				alert(e.message);
			}
		  } else {
			alert('Directions request failed due to ' + status);
		  }
		});
	});
}

function discardEst() {
	ocultarControlesBuscar();
	directionsDisplay.setMap(null);
	marker.setMap(null);
	mostrarControlesNuevo();
	lastPosition= {};
	navigator.geolocation.getCurrentPosition(onSuccessPos, onErrorPos);
	window.localStorage.setItem('ultimoest', JSON.stringify(lastPosition));
}

function useCurrentPos() {
	var lat, lng;
	if(app) {
		marker.setMap(null);
		
		ponerPinMapa(map, marker,lastPosition['lat'], lastPosition['lng'], 'Estacionaste acá!');
		ponermodalPos(lastPosition['lat'], lastPosition['lng']);
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

function ponerFotoExtra() {
	navigator.camera.getPicture(ponerMiniFotoExtra, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI,correctOrientation: true });
}

function ponerMiniFotoExtra(imageData) {
  $('.fotoExtra').html('<img src="'+imageData+'" class="imgSmallExtra">');
  lastPosition['img'] = imageData;
}

function capturePhotoWithFile() {
	navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI,correctOrientation: true });
}

// onError Callback receives a PositionError object
//
function onErrorPos(error) {
    alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}


function onFail(message) {
  alert('Failed because: ' + message);
}


function ponerTexto(texto) {
	var parentElement = document.getElementById('contenido');
	parentElement.innerHTML = texto;
}
