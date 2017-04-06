function InitialiserCarte(data) {
    // variables globales
    console.log(data);
    console.log(data[0].latitude);

    var maLat = 48.5;
    var maLng = 2.2;
    // configuration de la carte
    
        
    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    
    // recup localisation
    var rondPF = [];
    var rondCO2 = [];
    
    
    // boucle données pollution
    for(i = 0; i < data.length; i++){
        var lat = data[i].latitude;
        var lon = data[i].longitude;
        if (data[i].type == "PF")
            rondPF.push(L.circle([lat, lon], {radius: 300, color:'red'}).bindPopup('This is Littleton, CO.'));
        else
            rondCO2.push(L.circle([lat, lon], {radius: 300, color:'red'}).bindPopup('This is Littleton, CO.'));
    }

    
    // création des layers
    
    var pollutionCO = L.layerGroup(rondPF);
    var pollutionMP = L.layerGroup(rondCO2);
    
    
    // appel de la map 
    
    var maMap = L.map('maMap', {
        center: [maLat, maLng],
        zoom: 10,
        maxZoom: 18,
        minZoom: 3,
        layers: [pollutionCO, pollutionMP]
    });
    console.log(maMap._zoom);
    
    // localisation
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position){
                maLat = position.coords.latitude;
                maLng = position.coords.longitude;
                maMap.flyTo([maLat,maLng], 10);
                var maLocalisation = L.marker([maLat, maLng]).addTo(maMap);
                console.log('localisation trouvée, vous etes chanceux!');
        });
        
    }
    else
    {
        alert('localisation non accessible');
    }

    
    //Zoom event
    
    maMap.on("zoomend", function(){
        requestObject.zoom = maMap.getZoom();
        console.log(requestObject);
    });
    
    
    
    

    var overlayMaps ={
        "Taux de Co2": pollutionCO,
        "taux de micro particules": pollutionMP
    };
    
    L.control.layers(overlayMaps).addTo(maMap);

    L.tileLayer(osmUrl, {attribution: attribution,maxZoom: 50,}).addTo(maMap);
    
    // tape dans l'api
    
    var requestObject = {
        "zoom" :  0,
        "lattitude" : maLat,
        "longitude" : maLng
    };
    
    

    
    
};

//// on appel la fonction
//InitialiserCarte();

    

// rquette api
//http://10.40.73.234:8000/app.php/api/getAll
var data;
$.ajax({
    url : 'http://10.40.73.234:8000/app.php/api/getAll', // La ressource ciblée
    type : 'GET', // Le type de la requête HTTP.
    crossDomain: true,
//    dataType: 'jsonp'
}).done(function(data) {
    console.log(data);
    InitialiserCarte(data);
});


