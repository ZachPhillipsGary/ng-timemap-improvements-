function HeatMap(url){
this.url = url;
var blur = 20;
var radius = 20;
this.elements = [this];
this.vectorSource =  function() {
  return new ol.source.Vector({
    url: this.URL,
    projection: "EPSG:3857",
    format: new ol.format.KML({
      extractStyles: false
    })
});
}
this.vectorLayer =  function () {
var vector = new ol.layer.Heatmap({
  source: this.vectorSource(),
  blur: parseInt(blur, 10),
  radius: parseInt(radius, 10)
});

vector.getSource().on('addfeature', function(event) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  const featureDateRaw = event.feature["id_"];
  //process date into valid format
  const dateParts = featureDateRaw.split(" ");
  const month  = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateParts[1]) / 3 + 1; // convert month string into number
  const date = new Date(dateParts[0],Math.round(month),dateParts[2]);
    var name = event.feature.get('name');
    var magnitude = parseFloat(name.substr(2));
    console.log(magnitude);
    event.feature.set('weight', magnitude*100 - 5);

});
return vector;
};
const layerSource = this.vectorSource();
layerSource.forEachFeature(function(parameter) {
  console.log(parameter);
},this);
/*
const layerSource = this.vectorSource();
var firstDate;
var lastDate;
layerSource.forEachFeature(function(parameter) {
  console.log(parameter);
},this);
*/
};
