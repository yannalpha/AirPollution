
function InitialiserCarte() {
        var map = L.map('map').setView([45.7531152, 4.827906], 17);

        
        

//        configuration de la carte
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//        texte en bas de la carte
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        minZoom: 8,
    }).addTo(map);        

}
InitialiserCarte();

    


