
// variables globales

var maLat = 48.5;
var maLng = 2.2;

function InitialiserCarte() {

    // configuration de la carte
    
        
    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    
    // recup localisation
    


    
    // les marqueurs de co2
    var rond1 = L.circle([39.61, -105.02], {radius: 300, color:'red'}).bindPopup('This is Littleton, CO.'),
    rond2    = L.circle([39.74, -104.99], {radius: 200, color:'blue'}).bindPopup('This is Denver, CO.'),
    rond3    = L.circle([39.73, -104.8], {radius: 150, color:'green'}).bindPopup('This is Aurora, CO.'),
    rond4    = L.circle([39.77, -105.23], {radius: 180, color:'green'}).bindPopup('This is Golden, CO.');
    
    
    // les marqueurs de micro particules
    

    var rond5 = L.circle([39.68, -105.02], {radius: 800, color:'yellow'}).bindPopup('This is Littleton, CO.'),
    rond6    = L.circle([39.70, -104.99], {radius: 250, color:'yellow'}).bindPopup('This is Denver, CO.'),
    rond7    = L.circle([39.80, -104.8], {radius: 650, color:'yellow'}).bindPopup('This is Aurora, CO.'),
    rond8    = L.circle([39.66, -105.23], {radius: 210, color:'yellow'}).bindPopup('This is Golden, CO.');
    
    
    // création des layers
    
    var pollutionCO = L.layerGroup([rond1, rond2, rond3, rond4]);
    var pollutionMP = L.layerGroup([rond5, rond6, rond7, rond8]);
    
    
    // appel de la map 
    
    var maMap = L.map('maMap', {
        center: [maLat, maLng],
        zoom: 10,
        layers: [pollutionCO, pollutionMP]
    });

    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position){
                var infopos = "Position déterminée :\n";
                infopos += "Latitude : "+position.coords.latitude +"\n";
                maLat = position.coords.latitude;
                maLng = position.coords.longitude;
                infopos += "Longitude: "+position.coords.longitude+"\n";
                infopos += "Altitude : "+position.coords.altitude +"\n";
                document.getElementById("infoposition").innerHTML = infopos;
                maMap.setView([maLat,maLng], 10);
                var maLocalisation = L.marker([maLat, maLng]).addTo(maMap);
                
            alert('localisation trouvée, vous etes chanceux!');
        });
        
    }
    else
    {
        alert('localisation non accessible');
    }
    



    var overlayMaps = {
        "Taux de Co2": pollutionCO,
        "taux de micro particules": pollutionMP
    };
    L.control.layers(overlayMaps).addTo(maMap);

    L.tileLayer(osmUrl, {attribution: attribution,maxZoom: 50,}).addTo(maMap);
    

};
    

//// on appel la fonction
InitialiserCarte();

    


