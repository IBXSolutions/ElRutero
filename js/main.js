////////////////////////////////////////////////////////////////////////////////////////////////  
// VARIABLES
////////////////////////////////////////////////////////////////////////////////////////////////     

// Localización
var map, lat, lng, rutaNavegador;

// Orden de la ruta
var numPunto;
numPunto = 0;

// Drawer mostrado
var drawerOn = false;

// Tipo de mapa inicial
// Pueden ser: ROADMAP, SATELLITE, HYBRID, TERRAIN
var mapSelected = 'roadmap';
// Tipo de Ruta
var routeType = 'driving';

// Tipo de Vista
viewType = 'map';


////////////////////////////////////////////////////////////////////////////////////////////////  
// FUNCION GENERAL
////////////////////////////////////////////////////////////////////////////////////////////////     
//

$(function() {

    //limpiar();
    iniciar();
    
   

////////////////////////////////////////////////////////////////////////////////////////////////  
// FUNCIONES
////////////////////////////////////////////////////////////////////////////////////////////////     
//   
    
    /////// INICIAR   
    /**
     * INICIALIZA EL MAPA
     */
    function iniciar() {
        GMaps.geolocate({
            // TODO OK
            success: function(position) {
                // Carga la ruta guardada, si existe
                cargaRuta();
                $('#dvLoading').fadeOut(2000);
                // Si no hay ruta
                
                if(rutaNavegador === "") {
                    lat = position.coords.latitude; // guarda coords en lat y lng
                    lng = position.coords.longitude;
                    guardaRuta(lat, lng); // guardo en la variable ruta las coordenadas
                      
                } else {
                    lat = rutaNavegador[0][0];
                    lng = rutaNavegador[0][1];
                }
                
                // Constructor del mapa centrado en la posición actual
                map = new GMaps({
                    el: '#map',
                    lat: lat,
                    lng: lng,
                    disableDefaultUI: true,
                    click: enlazarMarcador,
                    tap: enlazarMarcador
                });
                
                
                // Añade marcador con la POSICIÓN ACTUAL
                nuevoMarker(0, lat, lng, false);
                
                // si se han almacenado más marcadores, añadir al mapa y trazar la ruta
                for(var i = 1; i < rutaNavegador.length; i++) {
                    agregaMarcadorGuardado(rutaNavegador[i][0], rutaNavegador[i][1], rutaNavegador[i][2]);
                }
            },
            // ERRORES
            error: function(error) {
                alert('Error geolocalización: ' + error.message);
                 map = new GMaps({
                    el: '#map',
                    disableDefaultUI: true,
                    click: enlazarMarcador,
                    tap: enlazarMarcador
                });
            },
            // GEOLOCALIZACIÓN NO SOPORTADA
            not_supported: function() {
                alert("Su navegador no soporta geolocalización");
                 map = new GMaps({
                    el: '#map',
                    disableDefaultUI: true,
                    click: enlazarMarcador,
                    tap: enlazarMarcador
                });
            },
        });
    };
    
    
    /**
     * AGREGA UN MARCADOR DE LA RUTA GUARDADA
     * nLat: latitud
     * nLng: Longitud
     * posicion: Número orden del Marker
     */
    function agregaMarcadorGuardado(nLat, nLng, posicion) {
        // Dibuja ruta entre marcas anteriores y actuales
        dibujaRuta(lat, lng, nLat, nLng);
       
        // Guarda las coordenadas como última posición
        lat = nLat;
        lng = nLng;
        
        // Añade el marcador
        nuevoMarker(posicion, lat, lng, true);
    }
    
    
      
    /**
     * CARGA LA RUTA DESDE localStorage
     */
    function cargaRuta() {
        rutaNavegador = (localStorage.rutaLocalStorage || "");
        if(rutaNavegador > "") {
            rutaNavegador = JSON.parse(rutaNavegador); // deserializar con JSON.parse
            console.log(rutaNavegador);
            numPunto = rutaNavegador.length - 1;
            console.log('numPunto = ' + numPunto);
        }
    }
    
    
    
    /**
     * GUARDA LA RUTA
     * lat: latitud
     * lng: longitud
     */
    function guardaRuta(lat, lng) {
        if(rutaNavegador === "") {
            rutaNavegador = [];
        }
        rutaNavegador.push([lat, lng, numPunto]);
        localStorage.rutaLocalStorage = JSON.stringify(rutaNavegador);
    }
    
    
    
    /**
     * INICIALIZA LA RUTA
     */
    function limpiar() { // limpia el mapa y empieza desde 0
        if(confirm("¿Quieres reiniciar la ruta?") === true) {
            rutaNavegador = "";
            localStorage.rutaLocalStorage = "";
            numPunto = 0;
            iniciar();
        }
    }

    /**
     * COMPACTAR LA RUTA
     */
    function compactar() { // Elimina puntos intermedios y redibuja el mapa entre el primero y el ultimo
        if(confirm("¿Quieres compactar la ruta?") === true) {
            var oldRuta = rutaNavegador;
            var itemsRuta;
            rutaNavegador = "";
            localStorage.rutaLocalStorage = "";
            numPunto = 0;
            guardaRuta(oldRuta[0][0], oldRuta[0][1]);
            numPunto++;
            iRuta = oldRuta.length - 1;
            guardaRuta(oldRuta[iRuta][0], oldRuta[iRuta][1]);
            iniciar();
        }

    }
    
    
    
    /**
     * ENLAZA EL MARCADOR CREADO CON EL ANTERIOR AL HACER UN CLICK
     * eventClicked: evento recibido
     */
    function enlazarMarcador(eventClicked) {
        //console.log ("Click-tap");
       
        // dibuja la ruta entre marcas anteriores y actuales
        dibujaRuta(lat, lng, eventClicked.latLng.lat(), eventClicked.latLng.lng()); 

        
        // guarda últimas coordenadas para marca siguiente
        lat = eventClicked.latLng.lat(); 
        lng = eventClicked.latLng.lng();
        numPunto++;
        
        // Añade el marcador
        nuevoMarker (numPunto, lat, lng, true);
       
        // Guardar el nuevo marcador
        guardaRuta(lat, lng, numPunto);
    }
    
    
    /**
     * CREA UN MARKER NUEVO
     * numPunto: numero de orden, si es el de inicio es el 0
     * markerLat: latitud
     * markerLng: longitud
     */
    
    function nuevoMarker(numPunto, markerLat, markerLng){
        if (numPunto === 0) {
        map.addMarker({
                lat: markerLat,
                lng: markerLng,
                title: "Inicio de ruta",
                infoWindow: {
                    content: '<p>Punto inicial de la ruta</p>'
                },
                icon: "img/home.png",
            });
        } else {
            map.addMarker({
                lat: markerLat,
                lng: markerLng,
                title: "Parada #" + numPunto,
                infoWindow: {
                    content: '<p>Parada #' + numPunto + '</p>'
                },
                icon: "img/step.png",
            });
        }
        
    }
    
    
    /**
     * DIBUJA UNA RUTA ENTRE 2 PUNTOS
     * latOrigen, lngOrigen: coordenadas de Origen
     * latDestino, lngDestino: coordenadas de Destino
     */
    function dibujaRuta(latOrigen, lngOrigen, latDestino, lngDestino){
        console.log (" ---> origen: " + latOrigen + " --- " + lngOrigen + " -----> destino: " + latDestino + " --- " + lngDestino)

        map.drawRoute({
            origin: [latOrigen, lngOrigen], // origen en coordenadas anteriores
            // destino en coordenadas suministradas a la función
            destination: [latDestino, lngDestino],
            travelMode: routeType,
            strokeColor: '#000000',
            strokeOpacity: 1,
            strokeWeight: 4
        });
    }
    
        
    
        
////////////////////////////////////////////////////////////////////////////////////////////////     
/////////// DRAWER     
////////////////////////////////////////////////////////////////////////////////////////////////     
        
    
    /**
     * Muestra el drawer
     */
    function mostrarDrawer() {
        console.log('Boton On');
        drawerOn = true;
        $('#drawer').animate({
            left: "+=200"
        }, 500);
    }

    /**
     * Esconde el drawer
     */
    function esconderDrawer() {
        console.log('Boton OFF');
        drawerOn = false
        $('#drawer').animate({
            left: "-=200"
        }, 500);
    }
    
    /**
     * Click en boton del drawer
     */
    $('.button-drawer').click(function() {
        if(drawerOn === false) {
            mostrarDrawer();
        } else {
            esconderDrawer();
        }
    });
    
    
    //// BOTONES DRAWER
    // Click en Reiniciar
    $("#iniciar").on('click', function() {
        limpiar();
        esconderDrawer();
    });
    
    // Click en Compactar
    $("#compactar").on('click', function() {
        compactar();
        esconderDrawer();
    });
    
    
});
