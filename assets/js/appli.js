/******************************************************************************/ 
/***************************** Variables Globales *****************************/
/******************************************************************************/

// lattittude et longitude + delta
var maLat;
var maLng;

// nom des types de données
var typeCo2 = "CO2";
var typePf = "PF";

// map and objetmap
var objetMap;

// nom des overlays
var overlayCo2 = "Taux de CO2";
var overlayPf = "Taux de particules fines";

// booléens d'actiovation des overlays
var isCo2Active = false;
var isPfActive = false;

// booléens de présence ou non de données dans les overlays
var isCo2Empty = true;
var isPfEmpty = true;

// creation layer group heatmap vide
var co2LayerGroup = L.layerGroup();
var pfLayerGroup = L.layerGroup();


/******************************************************************************/ 
/************************* Initialisation de la carte *************************/
/******************************************************************************/ 

function initialiserCarte() {

    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    
    var osmBase = 'http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png';
    var osm3 = 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png';
    var osm4 = 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
    var osm5 = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg';
    var osm6 = 'http://tile.stamen.com/toner/{z}/{x}/{y}.png';
    var osm7 = 'http://tile.stamen.com/burningmap/{z}/{x}/{y}.png';

    maLat = 47.6003779;
    maLng = 3.5299458;

    /*************************** controle des layers ***************************/
    
    var layerBase = L.tileLayer(osmBase, {attribution: attribution,maxZoom: 50,});
    var layer3 = L.tileLayer(osm3, {attribution: attribution,maxZoom: 50,});
    var layer4 = L.tileLayer(osm4, {attribution: attribution,maxZoom: 50,});
    var layer5 = L.tileLayer(osm5, {attribution: attribution,maxZoom: 50,});
    var layer6 = L.tileLayer(osm6, {attribution: attribution,maxZoom: 50,});
    var layer7 = L.tileLayer(osm7, {attribution: attribution,maxZoom: 50,});
    

    objetMap = L.map('maMap', {
        center: [maLat, maLng],
        zoom: 16,
        maxZoom: 18,
        minZoom: 3,
        layers: [layerBase]
    });

    var layerMap = {
        "greymap": layerBase,
        "layer3": layer3,
        "layer4": layer4,
        "terrain": layer5,
        "toner": layer6,
        "fire": layer7,
    }
    
    // initialisation d'overlay (filtre a cocher) via layer vide
    var overlayMaps = {
        [overlayCo2]: co2LayerGroup,
        [overlayPf]: pfLayerGroup
    };
    L.control.layers(layerMap, overlayMaps).addTo(objetMap);
    
    // actions au events
    initActionEvents();
    
};


/******************************************************************************/
/*********************************** Events ***********************************/
/******************************************************************************/

function initActionEvents() {
    objetMap.on('overlayadd', function(e) {
        if (e.name && e.name == overlayPf) {
            isPfActive = true;
            if (isPfEmpty)
                getAirPollution([typePf]);
        }
        else if (e.name && e.name == overlayCo2) {
            isCo2Active = true;
            if (isCo2Empty)
                getAirPollution([typeCo2]);
        }
    }).on('overlayremove', function(e) {
        if (e.name && e.name == overlayPf)
            isPfActive = false;
        else if (e.name && e.name == overlayCo2)
            isCo2Active = false;
    }).on("moveend", function(){
        if (!isCo2Empty) {
            co2LayerGroup.eachLayer(function(layer){
                co2LayerGroup.removeLayer(layer);
            });
            isCo2Empty = true;
        }
        if (!isPfEmpty) {
            pfLayerGroup.eachLayer(function(layer){
                pfLayerGroup.removeLayer(layer);
            });
            isPfEmpty = true;
        }
        if (isCo2Active && isPfActive)
            getAirPollution([typePf, typeCo2]);
        else if (isCo2Active)
            getAirPollution([typeCo2]);
        else if (isPfActive)
            getAirPollution([typePf]);
    });
};


/******************************************************************************/
/******************************** Requête ajax ********************************/
/******************************************************************************/

function getAirPollution(types) {
    $.ajax({
        url : getAirPollutionAjaxRequest(types),
        type : 'GET',
        crossDomain: true
    }).done(function(data) {
        console.log(data.length);
        setTypeEmplyBoolean(types, false);
        definitionDonnees(data);
    }).fail(function(err) {
        setTypeEmplyBoolean(types, false);
    });
}

function setTypeEmplyBoolean(types, value) {
    for (var i=0; i<types.length; i++) {
        if (types[i] == typePf)
            isPfEmpty = value;
        else if (types[i] == typeCo2)
            isCo2Empty = value;
    }
}

function getAirPollutionAjaxRequest(types) {
    var requestUrl =
        'http://cgportfolio.ddns.net/api/getBy' +
        '?lat=' + objetMap.getCenter().lat +
        '&long=' + objetMap.getCenter().lng +
        '&dLat=' + getDeltaLat() +
        '&dLong=' + getDeltaLong();

    if (types.length == 2)
        return requestUrl;
    else if (types[0] == typePf)
        return requestUrl + '&type=' + typePf;
    else if (types[0] == typeCo2)
        return requestUrl + '&type=' + typeCo2;
}


/******************************************************************************/
/*************************** Ajout data dans calque ***************************/
/******************************************************************************/

function definitionDonnees(data) {
    
    // variables globales
    var pfPoints = [];
    var co2Points = [];
    
    // boucle données pollution
    for(i = 0; i < data.length; i++){
        var lat = data[i].latitude;
        var lon = data[i].longitude;
        var valeur = data[i].valeur/100;
        
        // on boucle sur les points pour les mettre dans un tableau
        if (data[i].type == typePf)
            pfPoints.push([lat,lon,valeur]);
        else if (data[i].type == typeCo2)
            co2Points.push([lat,lon,valeur]);

    }
    
    co2LayerGroup.addLayer(L.heatLayer(co2Points, {blur: 30}));
    pfLayerGroup.addLayer(L.heatLayer(pfPoints, {blur: 25}));
    
};


/******************************************************************************/
/*********************** Fonctions de delta lat et long ***********************/
/******************************************************************************/

function getDeltaLat() {
    var lattitudeNordEst = objetMap.getBounds()._northEast.lat;
    var lattitudeSouthWest = objetMap.getBounds()._southWest.lat;
    return (lattitudeNordEst-lattitudeSouthWest)*0.55;
}

function getDeltaLong() {
    var longitudeNordEst = objetMap.getBounds()._northEast.lng;
    var longitudeSouthWest = objetMap.getBounds()._southWest.lng;
    return (longitudeNordEst-longitudeSouthWest)*0.55; 
}


/******************************************************************************/
/****************************** Onglet recherche ******************************/
/******************************************************************************/

function mapSearch() {
    
    var input = document.getElementById("searchBox");
    var searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0)
        return;

      var group = L.featureGroup();

      places.forEach(function(place) {
        // Create a marker for each place.
        console.log(places);
        console.log(place.geometry.location.lat() + " / " + place.geometry.location.lng());
        var marker = L.marker([
            place.geometry.location.lat(),
            place.geometry.location.lng()
        ]);
        group.addLayer(marker);
      });

      group.addTo(objetMap).bindPopup('une de vos recherches').openPopup();
      objetMap.fitBounds(group.getBounds());
    });

}


/******************************************************************************/
/******************************** Localisation ********************************/
/******************************************************************************/

jQuery('#maLocation').click(function(e) {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
                maLat = position.coords.latitude;
                maLng = position.coords.longitude;
                objetMap.flyTo([maLat,maLng], 10);
                var maLocalisation = L.marker([maLat, maLng]).addTo(objetMap).bindPopup('Vous ètes ici !').openPopup();
                console.log('localisation trouvée, vous etes chanceux!');
        });
    }
    else
        alert('localisation non accessible');
});


// On initialise la carte
initialiserCarte();

// La fonction de recherche
mapSearch();

// On initialise les datetimepickers 
jQuery(".datetimepicker-debut").datetimepicker();
jQuery(".datetimepicker-fin").datetimepicker();

