var map;
var mapmini;
var marker;
var markermini;
var lastPosition = {};
var historial = new Array();
var defLang = 'en';
var langArr = new Array();
var faqArr = new Array();
var confArr = new Array();
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
		alerta(e);
	}
	try {
		admob.initAdmob("ca-app-pub-4910383278905451/9199602365","ca-app-pub-4910383278905451/5078872411");
		admob.showBanner(admob.BannerSize.BANNER,admob.Position.TOP_APP);
	} catch(e) {
		//~ alert(e);
	}
	connectionStatus = navigator.onLine;
	if(navigator.globalization!=undefined) {
		navigator.globalization.getPreferredLanguage(
			function (language) {
				defLang = language.value.substring(0, 2);
			},
			function () {}
		);
	}

    var applaunchCount = 0;
	if(window.localStorage.getItem('launchCount')!='' && window.localStorage.getItem('launchCount')!=null) {
		applaunchCount = window.localStorage.getItem('launchCount');
	} else{
		window.localStorage.setItem('launchCount',1); 
		window.localStorage.setItem('config', '{"lang": "'+defLang+'","notif": "true","sounds": "true"}');
	}
	if(window.localStorage.getItem('config')!='' && window.localStorage.getItem('config')!=null) {
		confArr = JSON.parse(window.localStorage.getItem('config'));
	}
	
	if(window.localStorage.getItem('ultimoest')!='' && window.localStorage.getItem('ultimoest')!=null) {
		lastPosition = JSON.parse(window.localStorage.getItem('ultimoest'));
	}
	if(window.localStorage.getItem('historial')!='' && window.localStorage.getItem('historial')!=null) {
		historial = JSON.parse(window.localStorage.getItem('historial'));
	}
	
	var path = window.location.href.replace('index.html', '');
	var jsonURL = path+"conf/langs.json";
	
	
	$.ajax({
		url        : jsonURL,
		dataType   : 'json',
		success    : function(response) {
			langArr = response;
			cambiarIdioma();
		},
		error      : function(xhr, ajaxOptions, thrownError) {
		}
	});
	var jsonURL = path+"conf/faqs.json";
	
	$.ajax({
		url        : jsonURL,
		dataType   : 'json',
		success    : function(response) {
			faqArr = response;
		},
		error      : function(xhr, ajaxOptions, thrownError) {
			//~ console.log(thrownError);
		}
	});
	
	if(connectionStatus) {
		if(hayinfoGuard()) {
			//~ $('.btnMarcar').addClass('hidden');
			//~ $('.btnBuscar').removeClass('hidden');
		}
		geocoder = new google.maps.Geocoder;
		directionsService = new google.maps.DirectionsService;
		directionsDisplay = new google.maps.DirectionsRenderer({
			polylineOptions: {
				strokeColor: "#50a3f4"
			}
		});
		try {
			navigator.geolocation.getCurrentPosition(onSuccessPos, onErrorPos);
		} catch(e) {
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
			$('.minimapa').addClass('hidden');
			$('#map_canvas').addClass('hidden');
		}
		
	} else {
		if(hayinfoGuard()) {
		}
		$('.minimapa').addClass('hidden');
		$('#map_canvas').addClass('hidden');
	}
	checkAvailability();

	try {
		checkAvailability(); // start the check
	} catch(e) {
		alerta(e);
	}
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

function alerta(mensaje,titulo=getLangByKey("t37"),accion='sacarError();') {
	
	$('.modalError').removeClass('hidden');
	$('.modalError .tituloError').html(titulo);
	$('.modalError .textError').html(mensaje);
	$('.modalError .btnError').attr('onclick',accion);
	$('.modalError').animate( {opacity: "1"},300, function() {
	});
}

function sacarError() {
	$('.modalError').animate( {opacity: "0"},300, function() {
		$('.modalError').addClass('hidden');
		$('.modalError .tituloError').html('');
		$('.modalError .textError').html('');
		$('.modalError .btnError').attr('onclick','sacarError();');
	});
}

function volverAConf() {
	$('.modalVent.activo').animate( {left: "100%"},300, function() {
		$('.modalVent.activo').removeClass('activo');
		ponerModalsB('modalConfig');
	});
}

function selectLang(lang) {
	confArr['lang']=lang;
	window.localStorage.setItem('config', JSON.stringify(confArr));
	cambiarIdioma();
	return false;
}

function getLangByKey(key) {
	return langArr[confArr['lang']][key];
}

function cambiarIdioma() {
	var lkey;
	$('[data-textlang!=""]').each(function( index ) {
		lkey = $(this).data('textlang');
		if(lkey!=undefined) {
			$(this).html(getLangByKey(lkey));
		}
	});
	
	$('.btnLang').removeClass('activo');
	$('.btnLang .lang_'+confArr['lang']).addClass('activo');

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
  alerta('Failed because: ' + message);
}


function ponerTexto(texto) {
	var parentElement = document.getElementById('contenido');
	parentElement.innerHTML = texto;
}

/* Sin coneccion*/

function borrarHistorial() {
	if(confirm("¿Desea Borrar el historial?")) {
		$('#historialCont').html('');
		var historial = new Array();
		window.localStorage.setItem('historial', JSON.stringify(historial));
	}
}

function verHist() {
	ponerModalsB('modalHist');
	var conthist = '<ul class="listcomun">';
	historial.forEach(function(element) {
		//~ historialCont
		
		conthist += '<li class="listcomun"><b>'+element['fecha']+'</b>';
		conthist += (element['osbervaciones']!=undefined)?' '+element['osbervaciones']:'';
		conthist += '</li>';
	});
	conthist += '</ul>';
	$('#historialCont').html(conthist);
}

function mostrarIdiomas() {
	ponerModalsB('modaIdioma');
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
		directionsDisplay = new google.maps.DirectionsRenderer({
			polylineOptions: {
				strokeColor: "#50a3f4"
			}
		});
	}
	ponerPantalla("pantallaP");
}

function backMenu() {
	if (directionsDisplay != null) {
		directionsDisplay.setMap(null);
		directionsDisplay = null;
		directionsDisplay = new google.maps.DirectionsRenderer({
			polylineOptions: {
				strokeColor: "#50a3f4"
			}
		});
	}
	ponerPantalla("pantallaP");
}

/* con coneccion*/

function estConcon () {
	$('.modalVent').css({'min-height':$(window).height()}); 
	ponerModalsB("modalNuevoEstaCo");

	$('.fotoExtraCo').addClass('hidden');
	$('#osbervacionesC').parent().removeClass('conFoto');
	$('.fotoExtraCo').css({'background-image': 'none'});
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

var mostraFoto = false;
function mostrarFoto() {
	if(lastPosition['img']!=undefined) {
		if(!mostraFoto) {
			$('.ventanaFoto').css({'background-image':'url('+lastPosition['img']+')'});
			$('.ventanaFoto').removeClass('hidden');
			$('.ventanaFoto').animate( {opacity: "1"},300, function() {
				mostraFoto = true;
			});
		} else {
			$('.ventanaFoto').animate( {opacity: "0"},300, function() {
				mostraFoto = false;
				$('.ventanaFoto').addClass('hidden');
				$('.ventanaFoto').css({'background-image':'none'});
			});
		}
	}
}

function encConcon() {
	if(hayinfoGuard()) {
		ponerPantalla("pantallaConMapa");
		$('.fotoExtraSinco_c').addClass('hidden');
		$('#osbervacionesSC_').removeClass('conFoto');
		$('.fotoExtraSinco_c').css({'background-image': 'none'});
		$('#osbervacionesSC_c').html(lastPosition['osbervaciones']);
		if(lastPosition['img']!=undefined) {
			$('.fotoExtraSinco_c').removeClass('hidden');
			$('#osbervacionesSC_c').addClass('conFoto');
			$('.fotoExtraSinco_c').css({'background-image': 'url('+lastPosition['img']+')'});
		}
		
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
						alerta(e.message);
					}
				  } else {
					alerta('Directions request failed due to ' + status);
				  }
				});
			});
		} else {
		}
	} else {
		alerta(getLangByKey("t20"));
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
  alerta('FError: ' + message);
}

function sacarFotoCo() {
	try {
		navigator.camera.getPicture(onSacaFotoCo, onFailSincoFo, { quality: 50, destinationType: Camera.DestinationType.FILE_URI,correctOrientation: true });
	} catch(e) {
		alerta(e);
	}
}

function iniciarConFotoCo() {
	ponerModalsB("modalNuevoEstaCo");
	navigator.camera.getPicture(onSacaFotoCo, onFailSincoFo, { quality: 50, destinationType: Camera.DestinationType.FILE_URI,correctOrientation: true });
}

function cancelarSinco() {
	sacarModalVent();
}

Date.prototype.getMonthFormatted = function() {
	var month = this.getMonth() + 1;
	return month < 10 ? '0' + month : month;
}
Date.prototype.getDateFormatted = function() {
	var date = this.getDate();
	return date < 10 ? '0' + date : date;
}

function guardarCo() {
	lastPosition['tipo'] = 'C';
	var d = new Date();
	var datestring = d.getDateFormatted()  + "/" + d.getMonthFormatted()+ "/" + d.getFullYear() + " " +	d.getHours() + ":" + d.getMinutes();
	lastPosition['fecha'] = datestring;
	lastPosition['fechaobj'] = d;
	lastPosition['osbervaciones'] = $('#osbervacionesC').val();
	$('#osbervacionesC').val('');
	$('.fotoExtraSinco_c').html('');
	historial.push(lastPosition);
	window.localStorage.setItem('ultimoest', JSON.stringify(lastPosition));
	window.localStorage.setItem('historial', JSON.stringify(historial));
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
						
						$('.fotoExtraCo').removeClass('hidden');
						$('#osbervacionesC').parent().addClass('conFoto');
						$('.fotoExtraCo').css({'background-image': 'url('+lastPosition['img']+')'});
					} catch(e) {
						alerta(e.message);
					}
				});
			}, onFail);
		},
		function(e) {
		alerta('Unexpected error obtaining image file.');
		onFail(e);
	});
}

/* */


/* validacion de gps*/

function checkAvailability(){
    cordova.plugins.diagnostic.isGpsLocationAvailable(function(available){
        alerta("GPS location is " + (available ? "available" : "not available"));
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



function compartirApp() {
	var options = {
	  message: 'Where is My car', // not supported on some apps (Facebook, Instagram)
	  subject: 'Where is My car', // fi. for email
	  url: 'http://www.whereismycar.com/',
	  chooserTitle: 'Where is My car' // Android only, you can override the default share sheet title
	}
	window.plugins.socialsharing.shareWithOptions(options, compSuccess, compError);
}
var compSuccess = function(result) {
  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
  console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
}

var compError = function(msg) {
  console.log("Sharing failed with message: " + msg);
}

function infoApp() {
	ponerModalsB('modalInfo');
}

function ponerTutorial() {
	
	var count = 0;
	for (var k in faqArr[confArr['lang']]) {
		count++;
		$('#faqa').append(ponerPreguntarRes(faqArr[confArr['lang']][k]["pr"], faqArr[confArr['lang']][k]["re"],count));
	}
	$('#faqa').collapse();
	ponerModalsB('modalAyuda');
}

function puntuarApp() {
	
		navigator.notification.confirm(
		getLangByKey("t30"),
		function(button) {
			// yes = 1, no = 2, later = 3
			var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
			if (button == '1') {    // Rate Now
				if (deviceType!="Android") {
					cordova.plugins.market.open('id1332669884');
				} else if (deviceType=="Android") {
					cordova.plugins.market.open('com.ar.granhotelverona');
				}
			} else if (button == '2') { // Later
				this.core.rate_app_counter = 0;
			} else if (button == '3') { // No
				this.core.rate_app = false;
			}
		}, getLangByKey("t31"), [getLangByKey("t31"), getLangByKey("t32"), getLangByKey("t33")]);

}


function ponerPreguntarRes(pr,re,nu) {
	var blohtml = ''+
				'	<div class="panel panel-default">'+
				'		<div class="panel-heading" role="tab" id="heading'+nu+'">'+
				'			<h4 class="panel-title">'+
				'				<a class="collapsed" role="button" data-toggle="collapse" data-parent="#faqa" href="#collapse'+nu+'" aria-expanded="false" aria-controls="collapse'+nu+'">'+pr+'</a>'+
				'			</h4>'+
				'		</div>'+
				'		<div id="collapse'+nu+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading'+nu+'">'+
				'			<div class="panel-body">'+re+
				'			</div>'+
				'		</div>'+
				'	</div>';
	return blohtml;
}
$(document).ready(function() {
	
});
