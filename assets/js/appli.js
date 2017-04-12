/// la requette :
// center --> lat et long
// delta lat
// delta long
// type





//////////////////////   configuration de la carte /////////////////////////////

//Lattittude et longitude + delta
var maLat;
var maLng;


// map and objetmap
var objetMap;

// nom des overlays
var overlayCo2 = "Taux de Co2";
var overlayPf = "Taux de micro particules";

// booléens d'actiovation des overlays
var isCo2Active = false;
var isPfActive = false;

// booléens de présence ou non de données dans les overlays
var isCo2Empty = true;
var isPfEmpty = true;

// creation layer group heatmap vide
var co2LayerGroup = L.layerGroup();
var pfLayerGroup = L.layerGroup();






// param et création carte
function initialiserCarte(){

    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    
    var osmBase = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
    var osm2 = 'http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png';
    var osm3 = 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png';
    var osm4 = 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
    var osm5 = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg';
    var osm6 = 'http://tile.stamen.com/toner/{z}/{x}/{y}.png';
    var osm7 = 'http://tile.stamen.com/burningmap/{z}/{x}/{y}.png';

    maLat = 48.5;
    maLng = 2.2;
    
    //Layers Control
    
    var layerBase = L.tileLayer(osmBase, {attribution: attribution,maxZoom: 50,});
    var layer2 = L.tileLayer(osm2, {attribution: attribution,maxZoom: 50,});
    var layer3 = L.tileLayer(osm3, {attribution: attribution,maxZoom: 50,});
    var layer4 = L.tileLayer(osm4, {attribution: attribution,maxZoom: 50,});
    var layer5 = L.tileLayer(osm5, {attribution: attribution,maxZoom: 50,});
    var layer6 = L.tileLayer(osm6, {attribution: attribution,maxZoom: 50,});
    var layer7 = L.tileLayer(osm7, {attribution: attribution,maxZoom: 50,});
    

    objetMap = L.map('maMap', {
        center: [maLat, maLng],
        zoom: 10,
        maxZoom: 18,
        minZoom: 3,
        layers: [layerBase]
    });

    var layerMap = {
        "greymap": layerBase,
        "layer2": layer2,
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

    // action au event zoom and move
    initActionEvents();
    
};


///////////// La requette ajax
function getParticulesFines() {
    var requestUrl = 'http://cgportfolio.ddns.net/api/getBy' +
                        '?lat=' + objetMap.getCenter().lat +
                        '&long=' + objetMap.getCenter().lng +
                        '&dLat=' + getDeltaLat() +
                        '&dLong=' + getDeltaLong() + 
                        '&type=PF';
    // rquette api
    $.ajax({
        url : requestUrl, // La ressource ciblée
        type : 'GET', // Le type de la requête HTTP.
        crossDomain: true
    }).done(function(data) {
        console.log(data.length);
        isPfEmpty = false;
        definitionDonnees(data);
    }).fail(function(err) {
        isPfEmpty = true;
    });
};

///////////// La requette ajax
function getCo2() {
    var requestUrl = 'http://cgportfolio.ddns.net/api/getBy' +
                        '?lat=' + objetMap.getCenter().lat +
                        '&long=' + objetMap.getCenter().lng +
                        '&dLat=' + getDeltaLat() +
                        '&dLong=' + getDeltaLong() + 
                        '&type=CO2';
    // rquette api
    $.ajax({
        url : requestUrl, // La ressource ciblée
        type : 'GET', // Le type de la requête HTTP.
        crossDomain: true
    }).done(function(data) {
        console.log(data.length);
        isCo2Empty = false;
        definitionDonnees(data);
    }).fail(function(err) {
        isCo2Empty = true;
    });
};

///////////// La requette ajax
function getParticulesFinesAndCo2() {
    var requestUrl = 'http://cgportfolio.ddns.net/api/getBy' +
                        '?lat=' + objetMap.getCenter().lat +
                        '&long=' + objetMap.getCenter().lng +
                        '&dLat=' + getDeltaLat() +
                        '&dLong=' + getDeltaLong();
    // rquette api
    $.ajax({
        url : requestUrl, // La ressource ciblée
        type : 'GET', // Le type de la requête HTTP.
        crossDomain: true
    }).done(function(data) {
        console.log(data.length);
        isPfEmpty = isCo2Empty = false;
        definitionDonnees(data);
    }).fail(function(err) {
        isPfEmpty = isCo2Empty = true;
    });
};


/////////////////////  fonction requette http ///////////////////////
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
        if (data[i].type == "PF")
            pfPoints.push([lat,lon,valeur]);
        else
            co2Points.push([lat,lon,valeur]);

    }
    
    co2LayerGroup.addLayer(L.heatLayer(co2Points, {blur: 30}));
    pfLayerGroup.addLayer(L.heatLayer(pfPoints, {blur: 25}));
    
};

function getDeltaLat() {
    var lattitudeNordEst = objetMap.getBounds()._northEast.lat;
    var lattitudeSouthWest = objetMap.getBounds()._southWest.lat;
    return (lattitudeNordEst-lattitudeSouthWest)/2;
}

function getDeltaLong() {
    var longitudeNordEst = objetMap.getBounds()._northEast.lng;
    var longitudeSouthWest = objetMap.getBounds()._southWest.lng;
    return (longitudeNordEst-longitudeSouthWest)/2;
}


/// la fonction recherche
function mapSearch(){
    var search = L.Control.extend({
      onAdd: function() {
        var element = document.createElement("input");

        element.id = "searchBox";

        return element;
      }
    });

    (new search).addTo(objetMap);

    var input = document.getElementById("searchBox");

    var searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

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


//Zoom & move event, on genere le delta lat et long
function initActionEvents(){
    objetMap.on('overlayadd', function(e) {
        if (e.name && e.name == overlayPf) {
            isPfActive = true;
            if (isPfEmpty)
                getParticulesFines();
        }
        else if (e.name && e.name == overlayCo2) {
            isCo2Active = true;
            if (isCo2Empty)
                getCo2();
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
            getParticulesFinesAndCo2();
        else if (isCo2Active)
            getCo2();
        else if (isPfActive)
            getParticulesFines();

    });
};



// on initialise la carte
initialiserCarte();

// la fonction de recherche
mapSearch();

// initialisation des datepickers
jQuery(function() {
    jQuery(".datetimepicker-debut").datetimepicker();
    jQuery(".datetimepicker-fin").datetimepicker();
    // au clic sur "me localiser"
    jQuery('#maLocation').click(function(e) {
        // localisation 
        if(navigator.geolocation)
        {
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
});



