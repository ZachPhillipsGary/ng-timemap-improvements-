/*
Map Object Class
parameters:
  -lat: latiude in EPSG:4326
  -lon: lonitude in EPSG:4326
  -startDate: array of strings containing year, month and day 
  -endDate: array of strings containing year, month and day 
  -icon: html markup for description / icon
  -tags: array of strings
  -visible: should this object be rendered
  -html: item description
methods:
    LatLon(): returns latiude and longitude as openlayers lat lon object
    getFeature(): returns openlayers feature object for map object
    getTimelineObject():  returns vis timeline object for point
    getDates(): returns dates for object as js dates
*/
function MapObject(lat, log, title, startDate, endDate, icon, tags, html) {
    //object properties
    this.lat = parseFloat(lat) || 0; //latitude (decimal) EPSG:4326
    this.lon = parseFloat(log) || 0; //longitude (decimal) EPSG:4326
    this.title = title; // string containing unique identifier 
    this.startDate = startDate || []; 
    this.endDate = endDate || [];
    this.icon = icon || "";
    this.tags = tags || [];
    this.visible = true;
    this.html = html || ""; //html for popup balloon 
    //object methods
    this.LonLat = function() {
        return new ol.proj.transform([this.lon, this.lat], 'EPSG:3857', 'EPSG:3857')
    };
    this.getFeature = function() {
        if (this.visible)
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([this.lon, this.lat], 'EPSG:3857', 'EPSG:3857')),
                name: this.title,
                html: this.html,
                visible: this.visible,
                tags: this.tags,
                icon: this.icon
            });
        else
            var iconFeature = false;
        return iconFeature;
    };
    /*
    Constructs and returns visjs timeline item object
    */
    this.getTimelineObject = function() {
        var visObject = {}; //API description @ http://visjs.org/docs/timeline/
        visObject.latlon = this.LonLat();
        visObject.html = this.html;
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
        return visObject;
    };
    this.getDates = function() {
        var returnObject = {
            start: new Date()
        };
        if (!(typeof(this.startDate) === 'undefined')) {
            //date format = mm/dd/yyyy
            if (this.startDate.length === 3)
                returnObject.start = new Date(this.startDate[2], this.startDate[1], this.startDate[0]);
            //date format = Wed Mar 25 2015 01:00:00 GMT+0100 (W. Europe Standard Time)
            else if (this.startDate.length === 1)
                returnObject.start = new Date(this.startDate[0]);
            else
                alert("Error: Unsupported start date format on marker:" + this.title);
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
                alert("Error: Unsupported end date format on marker:" + this.title);
        }
        return returnObject;
    };
}