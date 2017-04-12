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
var layerMap;

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

    layerMap = {
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
        "Taux de Co2": co2LayerGroup,
        "taux de micro particules": pfLayerGroup
    };

    console.log(Object.keys(objetMap["_layers"]));
    L.control.layers(layerMap, overlayMaps).addTo(objetMap);
    
};

///////////// La requette ajax
function requeteAjax(requestUrl){
    // rquette api
    //http://10.40.73.234:8000/app.php/api/getAll
    var data;
    $.ajax({
        url : requestUrl, // La ressource ciblée
        type : 'GET', // Le type de la requête HTTP.
        crossDomain: true,
    //    dataType: 'jsonp'
    }).done(function(data) {
        //// on appel la fonction
        console.log("mes datas :  ")
        console.log(data);
        definitionDonnees(data);
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
    
    //Layer Groups
    
    // layer group class
    
    co2LayerGroup.addLayer(L.heatLayer(co2Points, {blur: 30}));
    pfLayerGroup.addLayer(L.heatLayer(pfPoints, {blur: 25}));
    
    
    
};


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
function actionEvent(action){
    objetMap.on(action, function(){
        zoomActuel = objetMap.getZoom();
        
        var centerMapLat = objetMap.getCenter().lat;
        var centerMapLong = objetMap.getCenter().lng;

        var lattitudeNordEst = objetMap.getBounds()["_northEast"]["lat"];
        var longitudeNordEst = objetMap.getBounds()["_northEast"]["lng"];

        var lattitudeSouthWest = objetMap.getBounds()["_southWest"]["lat"];
        var longitudeSouthWest = objetMap.getBounds()["_southWest"]["lng"];

        var dLat = (lattitudeNordEst - lattitudeSouthWest)/2 ;

        var dLong = (longitudeNordEst - longitudeSouthWest)/2;
        
        co2LayerGroup.eachLayer(function(layer){
            co2LayerGroup.removeLayer(layer);
        });
        
        pfLayerGroup.eachLayer(function(layer){
            pfLayerGroup.removeLayer(layer);
        });
        
        var requestUrl = 'http://cgportfolio.ddns.net/api/getBy' +
                        '?lat=' + centerMapLat +
                        '&long=' + centerMapLong +
                        '&dLat=' + dLat +
                        '&dLong=' + dLong;
        
        requeteAjax(requestUrl);

    });
};



// on initialise la carte
initialiserCarte();

// la fonction de recherche
mapSearch();

// action au event zoom and move
actionEvent("moveend");

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



