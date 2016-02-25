/*
Remote Layer Object Class
notes:
supports valid KML or geoJSON file as input
parameters:
  -url: location of remote data
  -type: 'GeoJSON' or 'KML'
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
function RemoteLayer(url, type, title, startDate, endDate, tags, uniqueid) {
    /* Check that remote file exists and is of proper format*/
    if (!((typeof type === "string") && ((type === 'GeoJSON') || (type === 'KML')))) {
        alert('Error:'+title+"is an invalid type.");
      }
        /*==========================================*/
        /* Declare private variables */
        /*==========================================*/

    /*==========================================*/
    /* Declare public variables */
    /*==========================================*/
    this.title = title || '';
    this.kind = "remoteLayer";
    this.startDate = startDate || [];
    this.endDate = endDate || [];
    this.tags = tags || [];
    this.url = url;
    this.url = this.url.split("//")[1];
    var proxyURL = "http://" + window.location.hostname.split(":")[0] + ":9251/"; //pass URL to the local CORS proxy
    this.url = proxyURL + this.url;
    console.log(this.url);
    this.type = type || "invalid";
    this.elements = [this]; // for future use.
    this.visible = true;
    var image = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
        })
    });

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        console.log(hex, result);
        var color = {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
        return "rgba(" + color.r + ", " + color.g + "," + color.b + ", 1.0);";
    }

    function capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    var styles = {
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
    /* Define private methods */

    /*==========================================*/
    /* Declare public methods */
    /*==========================================*/

    /*
     this.vectorLayer() -- returns ol3 source object for map object
    */
    this.vectorSource = function() {
            if (this.type === 'GeoJSON') {
                $.get(this.url, function(data) {
                    var jsonData = $.parseJSON(data);
                    if (jsonData.hasOwnProperty('feature')) {
                        for (var feature in jsonData.feature)
                            console.log(feature)

                    };
                });
                return new ol.source.Vector({
                    url: this.url,
                    format: new ol.format.GeoJSON()
                });
            }
            if (this.type === 'KML')
                return new ol.source.Vector({
                    url: this.url,
                    format: new ol.format.KML()
                });
        }
        /*
         this.vectorLayer() -- returns ol3 vector object for map object
        */
    this.vectorLayer = function() {
            function createOlStyle(type, properties, objecttoAdd) {
                console.log(type, properties)
                    //From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
                    /* hexToRgb
                    @pram{String} hex -- hex to convert
                    output: {r: INT, g:INT, b: INT} or NULL
                    */

                var image = new ol.style.Circle({
                    radius: 5,
                    fill: null,
                    stroke: new ol.style.Stroke({
                        color: 'red',
                        width: 1
                    })
                });

            }
            var style = {};
            if (this.type === 'KML')
                return new ol.layer.Vector({
                    source: new ol.source.Vector({
                        extractStyles: true, //use built in styles
                        url: this.url,
                        format: new ol.format.KML()
                    })
                });

            if (this.type === 'GeoJSON') {
                //get style info from the GeoJSON file and generate ol style object for it
                var styleProperties = {}; // temp var for geojson
                $.get(this.url, function(data) {
                        var jsonData = $.parseJSON(data);
                        console.log(jsonData, data);
                        if (jsonData.hasOwnProperty('features')) {
                            for (var i = 0; i < jsonData.features.length; i++) {
                                var type = 'invalid'; //store type of feature
                                if (jsonData.hasOwnProperty('type'))
                                    if (jsonData.features[i].hasOwnProperty('properties')) {
                                        console.log(jsonData.features[i].geometry.type, jsonData.features[i].properties);
                                        styleProperties[jsonData.features[i].geometry.type] = jsonData.features[i].properties;
                                    };
                            }
                            //apply style
                            for (var featureStyle in styleProperties) {
                                var currentObject = styleProperties[capitaliseFirstLetter(featureStyle)];
                                console.log('currentObject',currentObject);
                                const featureName = capitaliseFirstLetter(featureStyle);
                                if (styles.hasOwnProperty(featureName)) {
                                        styles[featureName] = new ol.style.Style({
                                                stroke: new ol.style.Stroke({
                                                    color: hexToRgb(currentObject.properties.stroke),
                                                    width: currentObject.properties['stroke-width']
                                                }),
                                                fill: new ol.style.Fill({
                                                    color: hexToRgb(currentObject.properties.fill)
                                                })
                                            });
                                            console.log(styles);
                                        }
                                    }
                                };
                            });
                        //get correct style for current geometry object
                        var styleFunction = function(feature) {
                            return styles[feature.getGeometry().getType()];
                        };
                        return new ol.layer.Vector({
                            source: new ol.source.Vector({
                                url: this.url,
                                format: new ol.format.GeoJSON()
                            }),
                            style: styleFunction
                        });
                    }
                }
                this.getTags = function() {
                    return this.tags.cus_unique(); //return an array of unique tags
                }
                this.getDates = function() {
                    var returnObject = {
                        start: new Date()
                    };
                    if (!(typeof(this.startDate) === 'undefined')) {
                        //date format = mm/dd/yyyy
                        if (this.startDate.length === 3)
                            returnObject.start = new Date(this.startDate[2], this.startDate[1], this.startDate[0]);
                        //date format = "Wed Mar 25 2015 01:00:00 GMT+0100 (W. Europe Standard Time)"
                        else if (this.startDate.length === 1)
                            returnObject.start = new Date(this.startDate[0]);
                        else
                            alert("Error: Unsupported start date format on layer:" + this.title);
                    } else {
                        alert("Error Date undefined on:" + this.title);
                    }
                    //markers without without an end date are allowed, but don't return an end
                    if (!(typeof(this.endDate) === 'undefined')) {
                        if (this.endDate.length == 3)
                            returnObject.end = new Date(this.endDate[2], this.endDate[1], this.endDate[0]);
                        //date format = Wed Mar 25 2015 01:00:00 GMT+0100 (W. Europe Standard Time)
                        else if (this.endDate.length == 1)
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
                    visObject.latlon = this.type; // so the system knows this is a layer file
                    //is the object a point or line on the timeline?
                    if (this.startDate === this.endDate) {
                        visObject.type = 'point';
                    } else {
                        if (this.endDate.length === 3) {
                            visObject.end = new Date(this.endDate[2], this.endDate[1], this.endDate[0]);
                        };
                    }
                    visObject.content = title;
                    visObject.start = new Date(this.startDate[2], this.startDate[1], this.startDate[0]);
                    return [visObject]; //expected as an array
                };

            }
