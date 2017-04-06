
//////////////////////   configuration de la carte /////////////////////////////
var maLat;
var maLng;
var objetMap;



// param et création carte
function initialiserCarte(){

    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
    var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';


    var maLat = 48.5;
    var maLng = 2.2;
    objetMap = L.map('maMap', {
        center: [maLat, maLng],
        zoom: 10,
        maxZoom: 18,
        minZoom: 3,
    });
    console.log(objetMap.getBounds());
    

    //Zoom event
    objetMap.on("zoomend", function(){
        zoomActuel = objetMap.getZoom();
        console.log(zoomActuel);
    });

    L.tileLayer(osmUrl, {attribution: attribution,maxZoom: 50,}).addTo(objetMap);
};











// layer de test au cas ou conection http rejetée
function testLayer(){
    
    var rondTestPoints = [];
    var testPoints = [
        [48.545, 2.555, 16],
        [48.58, 2.51, 20],
        [48.50, 2.52, 15],
        [48.51, 2.53, 38],
        [48.53, 2.54, 5],
        [48.45, 2.56, 2],
        [48.48, 2.57, 25],
        [48.485, 2.58, 78],
        [48.486, 2.59, 50],
        [48.487, 2.591, 21],
        [48.486, 2.592, 100],
        [48.512, 2.593, 75],
        [48.513, 2.594, 55],
        [48.514, 2.595, 4],
        [48.5146, 2.596, 8],
        [48.5148, 2.597, 20],
        [48.52, 2.598, 23],
        [48.521, 2.599, 41],
        [48.523, 2.5991, 23],
        [48.524, 2.5992, 17],
        [48.5245, 2.5993, 33],
        [48.5249, 2.5994, 12],
        [48.53, 2.5995, 157],
        [48.531, 2.5996, 28],
        [48.532, 2.5997, 6],
        [48.533, 2.5998, 8],
        [48.5333, 2.6, 46],
        [48.534, 2.61, 50],
        [48.54568, 2.62, 99],
        [48.5457, 2.63, 51],
        [48.5454, 2.64, 16],
        [48.5465, 2.65, 79],
        [48.5447, 2.66, 126],
        [48.5457, 2.67, 114],
        [48.5456789, 2.68, 250],
        [48.554, 2.69, 255],
        [48.5546, 2.7, 300],
        [48.5587, 2.75, 321],
        [50, 2.555, 16],
        [49, 2.51, 20],
        [49.3, 2.52, 15],
        [49.51, 2.53, 38],
        [49.53, 2.54, 5],
        [49.45, 2.56, 2],
        [49.48, 2.57, 25],
        [49.485, 2.58, 78],
        [49.486, 2.59, 50],
        [49.487, 2.591, 21],
        [49.486, 2.592, 100],
        [49.512, 2.593, 75],
        [49.513, 2.594, 55],
        [49.514, 2.595, 4],
        [49.5146, 2.596, 8],
        [49.5148, 2.597, 20],
        [49.52, 2.598, 23],
        [49.521, 2.599, 41],
        [49.523, 2.5991, 23],
        [49.524, 2.5992, 17],
        [49.5245, 2.5993, 33],
        [49.5249, 2.5994, 12],
        [49.53, 2.5995, 157],
        [49.531, 2.5996, 28],
        [49.532, 2.5997, 6],
        [49.533, 2.5998, 8],
        [49.5333, 2.6, 46],
        [49.534, 2.61, 50],
        [49.54568, 2.62, 99],
        [49.5457, 2.63, 51],
        [49.5454, 2.64, 16],
        [49.5465, 2.65, 79],
        [49.5447, 2.66, 126],
        [49.5457, 2.67, 114],
        [49.5456789, 2.68, 250],
        [49.554, 2.69, 255],
        [49.5546, 2.7, 300],
        [49.5587, 2.75, 321],
    ];
    rondTestPoints.push(L.heatLayer(testPoints)); // TEST
    var layerTest = L.layerGroup(rondTestPoints);

    console.log(Object.keys(objetMap["_layers"]));
    var overlayMaps ={
        "test de layer": layerTest
    };
    
    L.control.layers(overlayMaps).addTo(objetMap);


};


//// localisation

function maLocalisation(){
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
};




/////////////////////  fonction requette http ///////////////////////

function definitionDonnees(data) {
    
    // variables globales
    var rondPF = [];
    var rondCO2 = [];
    var pfPoints = [];
    var co2Points = [];
    
    
    
    // boucle données pollution
    for(i = 0; i < data.length; i++){
        var lat = data[i].latitude;
        var lon = data[i].longitude;
        var valeur = data[i].valeur/100;
        
        if (data[i].type == "PF"){
            pfPoints.push([lat,lon,valeur]); // on boucle sur les points pour les mettre dans un tableau  
        }
        else{
            co2Points.push([lat,lon,valeur]);
               
        }

    }
    rondPF.push(L.heatLayer(pfPoints)); // on regroupe les points dans un layer
    rondCO2.push(L.heatLayer(co2Points));
    
    // création des layers
    
    var pollutionCO = L.layerGroup(rondPF);
    var pollutionMP = L.layerGroup(rondCO2);


    console.log(Object.keys(objetMap["_layers"]));
    var overlayMaps ={
        "Taux de Co2": pollutionCO,
        "taux de micro particules": pollutionMP,
    };
    
    L.control.layers(overlayMaps).addTo(objetMap);
};



function requetteAjax(){
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
        console.log("mes datas :  ")
        console.log(data);
        definitionDonnees(data);
    }); 
};



initialiserCarte();
testLayer();
maLocalisation();
requetteAjax();