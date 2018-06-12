var map;
var mapmini;
var marker;
var markermini;
var lastPosition = {};
var pictureSource;   // picture source
var geocoder;
var vhei = window.innerHeight-150;
var directionsService;
var yamostrodir=false;
var directionsDisplay;
var destinationType; // sets the format of returned value 
var connectionStatus = false;

var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

if (app) {
	document.addEventListener("deviceready",onDeviceReady,false);
} else {
	onDeviceReady();
}


function onDeviceReady() {
	try {
		pictureSource=navigator.camera.PictureSourceType;
		destinationType=navigator.camera.DestinationType;
	} catch(e) {
	}
	connectionStatus = navigator.onLine;
	
	if(window.localStorage.getItem('ultimoest')!='' && window.localStorage.getItem('ultimoest')!=null) {
		lastPosition = JSON.parse(window.localStorage.getItem('ultimoest'));
	}
		
	interact('#map_canvas')
	  .resizable({
		// resize from all edges and corners
    edges: { left: false, right: false, bottom: true, top: false },

    // keep the edges inside the parent
    restrictEdges: {
      outer: 'parent',
      endOnly: true,
    },

    // minimum size
    restrictSize: {
      max: { height: vhei },
      min: { height: 50 },
    },

    inertia: true,
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  });
	
	if(connectionStatus) {
		if(hayinfoGuard()) {
			//~ $('.btnMarcar').addClass('hidden');
			//~ $('.btnBuscar').removeClass('hidden');
		}
		geocoder = new google.maps.Geocoder;
		directionsService = new google.maps.DirectionsService;
		directionsDisplay = new google.maps.DirectionsRenderer;
		try {
			navigator.geolocation.getCurrentPosition(onSuccessPos, onErrorPos);
		} catch(e) {
			console.log("pasa");
			//~ alert(e);
			$('.minimapa').addClass('hidden');
			$('#map_canvas').addClass('hidden');
		}
		try {
			mapmini = new google.maps.Map(document.getElementById('map_canvas'), {
			  mapTypeControl: false,
			  streetViewControl: false,
			  zoomControl: false,
			  fullscreenControl: false,
			  zoom: 16
			});
		} catch(e) {
			console.log("pasa2");
			//~ alert(e);
			$('.minimapa').addClass('hidden');
			$('#map_canvas').addClass('hidden');
		}
		
	} else {
		if(hayinfoGuard()) {
			//~ $('.btnMarcar').addClass('hidden');
			//~ $('.btnBuscar').removeClass('hidden');
		}
		$('.minimapa').addClass('hidden');
		$('#map_canvas').addClass('hidden');
	}
		

	//~ try {
		//~ checkAvailability(); // start the check
	//~ } catch(e) {
		//~ alert(e);
	//~ }

}

var imageIconna = {
    url: 'images/pinNar_32.png',
    size: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 32)
};
var shape = {
	coords: [1, 1, 1, 20, 18, 20, 18, 1],
	type: 'poly'
};

var noPoi = [
{
	featureType: "poi",
	stylers: [
	  { visibility: "off" }
	]   
  }
];

var onSuccessPos = function(position) {
	var myLatLng = {lat: lat, lng: lng};
	console.log(position);
	lastPosition['lat'] = position.coords.latitude;
	lastPosition['lng'] = position.coords.longitude;
};

function placeMarker(location, ty) {
	if(marker) marker.setMap(null);
	if(!ty) {
		lastPosition['lat'] = location.lat();
		lastPosition['lng'] = location.lng();
	} else {
		lastPosition['lat'] = location.lat;
		lastPosition['lng'] = location.lng;
	}
    marker = new google.maps.Marker({
        position: location, 
		icon: imageIconna,
        map: map,
		title: 'Estacionaste acá!'
    });
	setCalle(location, setModalCalle);
}

function ponerModalsB(pant) {
	var activos = $('.modalVent.activo').length;
	if(activos>0) {
		$('.modalVent.activo').animate( {left: "100%"},300, function() {
			$('.modalVent.activo').removeClass('activo');
			$('.'+pant).animate( {left: "0%"},300, function() {
				$('.'+pant).addClass('activo');
			});
		});
	} else {
		$('.'+pant).animate( {left: "0%"},300, function() {
			$('.'+pant).addClass('activo');
		});
	}	
}

function sacarModalVent() {
	$('.modalVent.activo').animate( {left: "100%"},300, function() {
		$('.modalVent.activo').removeClass('activo');
	});
}

function ponerPantalla(pantid) {
	$('.pantallaApp').addClass('hidden');
	$('#'+pantid).removeClass('hidden');
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
	$('#osbervacionesC').val(nombreCa);
	lastPosition['calle'] = nombreCa;
}

function onPhotoDataSuccess(imageData) {
  var smallImage = document.getElementById('smallImage');
  smallImage.style.display = 'block';
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

function cerrarModal(quien) {
   $(quien).animate( {top: "-120vh"},300);
}

// onError Callback receives a PositionError object
//
function onErrorPos(error) {
    //~ alert('La  geolocalizacion no funciona. code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	$('.minimapa').addClass('hidden');
	$('.modalNuevoEstaCo .tituloModal').html('SIN GPS');
}


function onFail(message) {
  alert('Failed because: ' + message);
}


function ponerTexto(texto) {
	var parentElement = document.getElementById('contenido');
	parentElement.innerHTML = texto;
}

/* Sin coneccion*/

function verHist() {
	ponerModalsB('modalHist');
}

function verConfig() {
	ponerModalsB('modalConfig');
}

function borrarEstacionamiento() {
	lastPosition = {};
	window.localStorage.setItem('ultimoest', JSON.stringify(lastPosition));
	if (directionsDisplay != null) {
		directionsDisplay.setMap(null);
		directionsDisplay = null;
		directionsDisplay = new google.maps.DirectionsRenderer;
	}
	ponerPantalla("pantallaP");
}

function backMenu() {
	if (directionsDisplay != null) {
		directionsDisplay.setMap(null);
		directionsDisplay = null;
		directionsDisplay = new google.maps.DirectionsRenderer;
	}
	ponerPantalla("pantallaP");
}

/* con coneccion*/

function estConcon () {
	ponerModalsB("modalNuevoEstaCo");
	if(connectionStatus) {
		$('.modalNuevoEstaCo .tituloModal').html('ESTACIONAR');
		$('.minimapa').removeClass('hidden');
		try {
			var lat = lastPosition['lat'];
			var lng = lastPosition['lng'];
			
			var myLatLng = {lat: lat, lng: lng};
			if(!map) {
				map = new google.maps.Map(document.getElementById('captureMod'), {
					mapTypeControl: false,
					streetViewControl: false,
					zoomControl: false,
					fullscreenControl: false,
					zoom: 16
				});
				if(lat!='') map.setCenter(new google.maps.LatLng(lat, lng));
				map.setOptions({styles: noPoi});
				
				google.maps.event.addListener(map, 'click', function(event) {
				   placeMarker(event.latLng);
				});
			}
			navigator.geolocation.getCurrentPosition(function(position) {
				var myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};
				lastPosition['lat'] = position.coords.latitude;
				lastPosition['lng'] = position.coords.longitude;
				map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
				placeMarker(myLatLng, true);
			}, onErrorPos);
				
		} catch(e) {
			$('.minimapa').addClass('hidden');
			$('.modalNuevoEstaCo .tituloModal').html('SIN GPS');
		}
	} else {
		$('.minimapa').addClass('hidden');
		$('.modalNuevoEstaCo .tituloModal').html('SIN CONEXIÓN');
	}
}



function encConcon() {
	if(hayinfoGuard()) {
		ponerPantalla("pantallaConMapa");
		
		$('#osbervacionesSC_c').html(lastPosition['osbervaciones']);
		if(lastPosition['img']!=undefined) $('.fotoExtraSinco_c').html('<img src="'+lastPosition['img']+'" class="imgSmallExtra">');
		
		if(connectionStatus) {
			if(yamostrodir) directionsDisplay.setMap(null);
			if(marker) marker.setMap(null);
			//~ directionsDisplay.setMap(map);
			directionsDisplay.setMap(mapmini);
			navigator.geolocation.getCurrentPosition(function (position) {
				if(marker) marker.setMap(null);
				directionsService.route({
				  origin: ''+position.coords.latitude+','+position.coords.longitude,
				  destination: ''+lastPosition['lat']+','+lastPosition['lng'],
				  optimizeWaypoints: true,
				  travelMode: 'WALKING'
				}, function(response, status) {
					yamostrodir = true;
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
		} else {
		}
	} else {
		alert("No existe un estacionamiento en curso");
	}
}

function hayinfoGuard() {
	var count = 0;
	for (var k in lastPosition) {
		if (lastPosition.hasOwnProperty(k)) {
		   ++count;
		}
	}
	if(count>0) {
		return true;
	} else {
		return false;
	}
}

function onFailSincoFo(message) {
  alert('Fallo. Error: ' + message);
}

function sacarFotoCo() {
	try {
		navigator.camera.getPicture(onSacaFotoCo, onFailSincoFo, { quality: 50, destinationType: Camera.DestinationType.FILE_URI,correctOrientation: true });
	} catch(e) {
		alert(e);
	}
}

function iniciarConFotoCo() {
	ponerModalsB("modalNuevoEstaCo");
	navigator.camera.getPicture(onSacaFotoCo, onFailSincoFo, { quality: 50, destinationType: Camera.DestinationType.FILE_URI,correctOrientation: true });
}

function cancelarSinco() {
	sacarModalVent();
}

function guardarCo() {
	lastPosition['tipo'] = 'C';
	lastPosition['osbervaciones'] = $('#osbervacionesC').val();
	$('#osbervacionesC').val('');
	$('.fotoExtraSinco_c').html('');
	window.localStorage.setItem('ultimoest', JSON.stringify(lastPosition));
	$('.btnMarcar').addClass('hidden');
	$('.btnBuscar').removeClass('hidden');
	
	sacarModalVent();
}

function onSacaFotoCo(img) {
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
						$('.fotoExtraCo').html('<img src="'+lastPosition['img']+'" class="imgSmallExtra">');
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

/* */


/* validacion de gps*/

function checkAvailability(){
    cordova.plugins.diagnostic.isGpsLocationAvailable(function(available){
        console.log("GPS location is " + (available ? "available" : "not available"));
        if(!available){
           checkAuthorization();
        }else{
            console.log("GPS location is ready to use");
        }
    }, function(error){
        console.error("The following error occurred: "+error);
    });
}

function checkAuthorization(){
    cordova.plugins.diagnostic.isLocationAuthorized(function(authorized){
        console.log("Location is " + (authorized ? "authorized" : "unauthorized"));
        if(authorized){
            checkDeviceSetting();
        }else{
            cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
                switch(status){
                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        console.log("Permission granted");
                        checkDeviceSetting();
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED:
                        console.log("Permission denied");
                        // User denied permission
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                        console.log("Permission permanently denied");
                        // User denied permission permanently
                        break;
                }
            }, function(error){
                console.error(error);
            });
        }
    }, function(error){
        console.error("The following error occurred: "+error);
    });
}

function checkDeviceSetting(){
    cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
        console.log("GPS location setting is " + (enabled ? "enabled" : "disabled"));
        if(!enabled){
            cordova.plugins.locationAccuracy.request(function (success){
                console.log("Successfully requested high accuracy location mode: "+success.message);
            }, function onRequestFailure(error){
                console.error("Accuracy request failed: error code="+error.code+"; error message="+error.message);
                if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
                    if(confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")){
                        cordova.plugins.diagnostic.switchToLocationSettings();
                    }
                }
            }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        }
    }, function(error){
        console.error("The following error occurred: "+error);
    });
}