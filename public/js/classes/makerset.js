//Timemap Classes
"use strict";


/*
Category Class
parameters:
  -elements: list of MapObjects or geoJSON objects
  -icon: ol json formatting for image to display
methods:
vectorSource() - returns an openlayers3 vector containing the category features
features() - returns a list containing the category features
iconStyle() - returns ol style object for class of objects
*/
function Category(elements,title,style) {
    /*==========================================*/
    //private variables
    /*==========================================*/
    var defaultMarkerStyle = {
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                visible: this.visible,
                src: "http://openlayers.org/en/v3.9.0/examples/data/icon.png"
            };
    /*==========================================*/
    //public variables
    /*==========================================*/
    this.visible = true;
    this.title = title || guid();
    this.elements = elements || [];
    //process marker style json
     this.markerStyle = String(style);
     //if the image column contains data, attempt to get JSON icon description
     if (this.markerStyle.length > 1) 
         this.markerStyle = $.parseJSON(this.markerStyle);
     else
          this.markerStyle = defaultMarkerStyle
    
    /*==========================================*/
    //public methods
    /*==========================================*/
    /*
    vectorSource - returns an openlayers3 vector containing the category features
    */
    this.vectorSource = function() {
        var iconFeatures = new ol.source.Vector({
                //create empty vector
        }); 
        iconFeatures.kind = 'ol.source.Vector';
        // store the ol features
        for (var i = this.elements.length - 1; i >= 0; i--) {
            if ( this.elements[i].visible === true ) {
                iconFeatures.addFeature(this.elements[i].getFeature());
            }
        };
        return iconFeatures;
    };
    /*
    features - returns a list containing the category features
    */
    this.features = function() {
        elementFeatures = [];
        for (var i = this.elements.length - 1; i >= 0; i--) {
            var feature = this.elements[i].getFeature();
            if (typeof feature === 'object')
                 elementFeatures.push(feature);
        }
        return elementFeatures;
    };
     /*
    iconStyle - returns ol graphic object for category maker
    */
    this.iconStyle = function() {
        //create the style
        return new ol.style.Style({
            image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ (this.markerStyle))
        });
    };

    /*
    vectorLayer - returns ol object with category objects + category style
    */
    this.vectorLayer = function() {
            //add the feature vector to the layer vector, and apply a style to whole layer
        return new ol.layer.Vector({
            source: this.vectorSource(),
            style: this.iconStyle(),
            visible: this.visible
        });
    }
    /*
    add --  validates & appends a MapObject to the category's elements array
    */
    this.add = function(mapobj) {
        this.elements.push(mapobj);
    };
    /*
    getTags -- returns an array containing all MapObject tags (strings) with no duplicates
    */
    this.getTags = function () {
      var tags = [];
      for (var i = this.elements.length - 1; i >= 0; i--) {
       for (var k =  this.elements[i].tags.length - 1; k >= 0; k--) {
        if ( $.inArray(this.elements[i].tags[k],tags) < 0 )
         tags.push(this.elements[i].tags[k])
       };
      };
      return tags;
    };
    /*
    getTimelineObject -- returns an array of vis timeline objects for the map
    */
    this.getTimelineObject = function() {
        var visObjects = [];
        for (var i = this.elements.length - 1; i >= 0; i--) {
            visObjects.push(this.elements[i].getTimelineObject());
        };
        return visObjects;
    };
};


