
//////////////////////   configuration de la carte /////////////////////////////
var maLat = 48.5;
var maLng = 2.2;
var objetMap;

function initialiserCarte(){

    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';


    var maLat = 48.5;
    var maLng = 2.2;

    // localisation 
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position){
                maLat = position.coords.latitude;
                maLng = position.coords.longitude;
                objetMap.flyTo([maLat,maLng], 10);
                var maLocalisation = L.marker([maLat, maLng]).addTo(objetMap);
                console.log('localisation trouvée, vous etes chanceux!');
        });

    }
    else
    {
        alert('localisation non accessible');
    }



    objetMap = L.map('maMap', {
        center: [maLat, maLng],
        zoom: 10,
        maxZoom: 18,
        minZoom: 3,
    });
    

    //Zoom event
    objetMap.on("zoomend", function(){
        requestObject.zoom = objetMap.getZoom();
    });

    // tape dans l'api
    
    var requestObject = {
        "zoom" :  0,
        "lattitude" : maLat,
        "longitude" : maLng
    };

    L.tileLayer(osmUrl, {attribution: attribution,maxZoom: 50,}).addTo(objetMap);
};

initialiserCarte();


/////////////////////  fonction requette http ///////////////////////

function definitionDonnees(data) {
    
    // variables globales
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
    
    
    console.log(Object.keys(objetMap["_layers"]));
    var overlayMaps ={
        "Taux de Co2": pollutionCO,
        "taux de micro particules": pollutionMP
    };
    
    L.control.layers(overlayMaps).addTo(objetMap);
    
};



    

// rquette api
//http://10.40.73.234:8000/app.php/api/getAll
var data;
$.ajax({
    url : 'http://10.40.73.234:8000/app.php/api/getAll', // La ressource ciblée
    type : 'GET', // Le type de la requête HTTP.
    crossDomain: true,
//    dataType: 'jsonp'
}).done(function(data) {
    //// on appel la fonction
    definitionDonnees(data);
});


