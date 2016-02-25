/*
Local geoJSON Category Object Class
notes:
geoJSON features themselves DO NOT have individual tags 
parameters:
  -json: json string for object
  -jsonstyle ol style object for json defined features
  -startDate: array of strings containing year, month and day 
  -endDate: array of strings containing year, month and day 
  -icon: html markup for description / icon
  -tags: array of strings
  -visible: should this object be rendered
methods:
    getFeature(): returns openlayers feature object for map object
    getTimelineObject():  returns vis timeline object for point
    getDates(): returns dates for object as js dates
    vectorSource: returns ol.Source.Vector object with geojson features.
*/

function geoJSONCategory(json, title, startDate, endDate,tags, uniqueid) {
    /* Define private vars */
    var image = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({color: 'red', width: 1})
    });
    /* Create a default layout for data */
var defaultJSONStyle = {
  'Point': new ol.style.Style({
    image: image
  }),
  'LineString': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  }),
  'MultiLineString': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  }),
  'MultiPoint': new ol.style.Style({
    image: image
  }),
  'MultiPolygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'yellow',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  }),
  'Polygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  }),
  'GeometryCollection': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'magenta'
    }),
    image: new ol.style.Circle({
      radius: 10,
      fill: null,
      stroke: new ol.style.Stroke({
        color: 'magenta'
      })
    })
  }),
  'Circle': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0.2)'
    })
  })
};
    /* Declare public variables */
    this.title = title || '';
    this.kind = "geoJSONLayer"; 
    this.startDate = startDate || [];
    this.endDate = endDate || [];
    this.tags = tags || [];
    this.jsonString = json || {};
    this.jsonstyle = json;
    this.elements = [this]; // for future use.
    this.visible = true;
    /* Define private methods */
    /* styleFunction() -- gets styles for json features */
    var styleFunction = function(feature, resolution) {
    return defaultJSONStyle[feature.getGeometry().getType()];
    };
 /*==========================================*/
    /* Declare public methods */
    this.add =  function(jsonString) {
        this.jsonString = jsonString;
    }
    this.vectorSource = function() {
    return new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(this.jsonString)
      });
    }
    this.vectorLayer = function() {
    return new ol.layer.Vector({
        source: this.vectorSource(),
        visible: this.visible,
        style: styleFunction
      });
    }
    this.getTags = function() {
        return this.tags.cus_unique(); //return an array of unique tags
    }
    this.getDates = function()  {
        var returnObject = { start: new Date() };
        if (!(typeof(this.startDate) === 'undefined')) {
        //date format = mm/dd/yyyy
        if( this.startDate.length === 3 )
            returnObject.start = new Date(this.startDate[2],this.startDate[1],this.startDate[0]);
        //date format = "Wed Mar 25 2015 01:00:00 GMT+0100 (W. Europe Standard Time)"
        else if( this.startDate.length === 1 ) 
            returnObject.start = new Date(this.startDate[0]);
        else
            alert("Error: Unsupported start date format on layer:" + this.title);
    } else {
        alert("Error Date undefined on:" + this.title);
    }  
        //markers without without an end date are allowed, but don't return an end 
    if(!(typeof(this.endDate) === 'undefined')) {
        if( this.endDate.length == 3 )
            returnObject.end = new Date(this.endDate[2],this.endDate[1],this.endDate[0]);
        //date format = Wed Mar 25 2015 01:00:00 GMT+0100 (W. Europe Standard Time)
        else if( this.endDate.length == 1 ) 
            returnObject.end = new Date(this.endDate[0]);
        else
            alert("Error: Unsupported end date format on layer:" + this.title);
    }
        return returnObject;
    };
    this.features = function() {
        /*
        For future use.
        */
        return this.elements.cus_unique();
    }
    this.getTimelineObject = function() {
        var visObject = {}; //API description @ http://visjs.org/docs/timeline/
        visObject.latlon = "geoJSON"; 
        //is the object a point or line on the time line?
        if (this.startDate === this.endDate) {
            visObject.type = 'point';
         } else {
             if ( this.endDate.length === 3 ) {
                    visObject.end = new Date(this.endDate[2],this.endDate[1],this.endDate[0]);
             };
         }
        visObject.content = title;
        visObject.start = new Date(this.startDate[2],this.startDate[1],this.startDate[0]);
        return [visObject]; //expected as an array
    };
    /* initialize */
    this.add(json);
}
