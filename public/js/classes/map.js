
/*==========================================*/
//define map class
/*==========================================*/
function Map(timemap_instance, data, renderlocation, initialmapstate, debug) {
    /*
    parent -- reference to parent timemap object
    */
    this.parent = timemap_instance;
    /*
    renderlocation -- id of div container for map
    */
    this.renderlocation = renderlocation || '';
    /*
    categories -- an array of category objects
    */
    this.categories = [];
    /*
    The data parameter can either be an array of Categories or a single Category.
    The mapObjects variable stores an array of openlayers objects holding the map layers and basemap objects
    */
    this.mapObjects = [];
    /*
    this.mapData - the original object(s) used to generate the map layers
    */
    this.mapData = [];
    /*
    generateOlLayers() -- Creates ol layers vector objects for map from Category or array of Category objects and loads them into map objects
    */
    this.generateOlLayers = function() {
        //add osm layernew ol.layer.Tile({
  var mapSource =  new ol.source.Stamen({
    layer: 'toner'
  });

        this.mapObjects.push(new ol.layer.Tile({
            source: mapSource,

        }));
        if (data.constructor === Array) {
            for (var i = data.length - 1; i >= 0; i--) {
                var layer = data[i].vectorLayer();
                layer.kind = "Category";
                layer.tmid = i; //create unique id for access when updating
                console.log(layer.getStyle());
                this.mapObjects.push(layer);
                this.mapData[i] = data[i];
            };
        } else {
            //only a single data element exists
            var layer = data.vectorLayer();
            layer.kind = "Category";
            layer.tmid = 0; //create unique id for access when updating
            this.mapData[0] = data;
            this.mapObjects.push(layer);
        }
    }
    this.filterByTags = function(tag) {
            for (var i = this.mapData.length - 1; i >= 0; i--) {
                if (this.mapData[i].hasOwnProperty('tags')) {
                        for (var l = 0; l < this.mapData[l].length; l++) {
                            if(this.mapData[i].tags[l] == tag)
                                this.mapData[i].visible = false;
                        };
                } else if (this.mapData[i].hasOwnProperty('elements')){
                        for (var l = 0; l < this.mapData[i].elements.length; l++) {
                            if (this.mapData[i].elements[l].hasOwnProperty('tags')) {

                                for (var k = 0; k < this.mapData[i].elements[l].tags.length; k++) {
                                    if(tag  === 'Show All') {
                                        this.mapData[i].elements[l].visible = true;
                                    } else {
                                        if(this.mapData[i].elements[l].tags[k] != tag)
                                                this.mapData[i].elements[l].visible = false;
                                            else
                                                this.mapData[i].elements[l].visible = true;
                                        }
                               }
                       }
                        };
                }
            };
           this.update();
        }
        /*
        drawFilter -- generates html for filter
        */
    this.drawFilter = function() {
            /* Create UI and start event listeners for category filters */
            //inject select zone
            var location = document.getElementById("filters");
            var htmlToReturn = "";
            htmlToReturn += "<select id='" + renderlocation + '_filters' + "' multiple='multiple' >";

            for (var i = this.mapData.length - 1; i >= 0; i--) {
                htmlToReturn += "<option value='" + i + "'>" + this.mapData[i].title + "</option>";

            };
            app.visibleCategories = [];
            app.hiddenCategories = [];
            htmlToReturn += '</select>';
            location.innerHTML += htmlToReturn;
            var handlers = {
                afterSelect: function(values) {
                    //set as invisible
                    app.hiddenCategories.push(values);
                },
                afterDeselect: function(values) {
                    //set category as visible again
                    app.visibleCategories.push(values);
                }


            }
            var selectName = String(renderlocation) + '_filters';
            $('#'+selectName).multiSelect(handlers);
            /* Now add tag filter UI */
            var taglocation = document.getElementById("mapObjects");
            htmlToReturn = '';
            htmlToReturn += '<div data-placement="bottom" data-toggle="tooltip" title="Filter by tag"  class="tmtagCtrl" style="z-index:999; position: absolute; top: 10px; right: 10px; padding: 5px; background-color: rgba(255,255,255,0.5);"><select id="' + renderlocation + '_filters_tag">';
            htmlToReturn += '<option value="!!!!!_ALL_!!!!!!">' +
                "Show All" + '</option>';

            var tags = []; // a list of unique tags
            for (var i = this.mapData.length - 1; i >= 0; i--) {
                var categoryTags = this.mapData[i].getTags() || [];
                for (var z = categoryTags.length - 1; z >= 0; z--) {
                    if ($.inArray(categoryTags[z], tags) < 0) {
                        tags.push(categoryTags[z]);
                        htmlToReturn += '<option value="' + categoryTags[z] + '">' + categoryTags[z] + '</option>';
                    }
                };
            };
            htmlToReturn += '</select>';
            ///add to string to inject
            taglocation.innerHTML += htmlToReturn;
           if (debug) console.log('id of taq filter select:','#' + renderlocation + '_filters_tag' + ' option:selected')
            var id = '#' + renderlocation + '_filters_tag';
            //add event listener for filter change
            $(id).change(function() {
                timemap_instance.map.filterByTags($(id + " option:selected").text());
            });


        }
        /*==========================================*/
        //initialize map
        /*==========================================*/

    /*
    Declare Private Vars
    */
    // default zoom, center and rotation
    var zoom = 2;
    var center = [0, 0];
    var rotation = 0;
    if (typeof initialmapstate !== "undefined") {
        zoom = initialmapstate.zoom || zoom;
        center = initialmapstate.center || center;
        rotation = initialmapstate.rotation || rotation;
    }
    /*
        Create a popup window and display when a marker is clicked.
        */
    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false
    });

    this.initalize = function() {
        //convert input into openlayers format and render filters
        this.generateOlLayers();
        this.drawFilter();

        //display only visible map elements
        if (debug) console.log(data.elements);
        //define the map object
        this.m = new ol.Map({
            controls: ol.control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                    collapsible: false
                })
            }).extend([
                //add custom buttons
                new timemap_instance.FilterButton({}, this),
                new timemap_instance.EditButton({},this.parent)
            ]),
            layers: this.mapObjects,
            target: document.getElementById(String(this.renderlocation)),
            view: new ol.View({
                center: center,
                zoom: zoom,
                rotation: rotation,
            })
        });
        //add tooltips
        $('[data-toggle="tooltip"]').tooltip();

        //add a click event listener
        this.m.on('singleclick', function(evt) {
            var coordinates = this.m.getEventCoordinate(evt.originalEvent);
            console.log(ol.proj.transform([coordinates[0], coordinates[1]], 'EPSG:3857', new ol.source.OSM().getProjection()));
            /*
            If instance is in edit mode
            */
            if (this.parent.edit)
                this.parent.newMarker = coordinates;
        }, this);
        var shouldUpdate = true;
        var view = this.m.getView();
        this.updatePermalinks = function() {

            if (!shouldUpdate) {
                // do not update the URL when the view was changed in the 'popstate' handler
                shouldUpdate = true;
                return;
            }

            var center = view.getCenter();
            var hash = '#map=' +
                view.getZoom() + '/' +
                Math.round(center[0] * 100) / 100 + '/' +
                Math.round(center[1] * 100) / 100 + '/' +
                view.getRotation();
            var state = {
                zoom: view.getZoom(),
                center: view.getCenter(),
                rotation: view.getRotation()
            };
            if (this.hasOwnProperty('tmhash'))
                window.history.pushState(state, 'map', hash + this.tmhash);
            else
                window.history.pushState(state, 'map', hash);

        };
        /* Because the ol3 .on method is stupid */
        var callUpdatePermaLinks = function() {
            this.updatePermalinks();
        }
        this.m.on('moveend', callUpdatePermaLinks, this);
        // restore the view state when navigating through the history, see
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
        window.addEventListener('popstate', function(event) {
            if (event.state === null) {
                return;
            }
            this.m.getView().setCenter(event.state.center);
            this.m.getView().setZoom(event.state.zoom);
            this.m.getView().setRotation(event.state.rotation);
            shouldUpdate = false;
        });
        /*==========================================*/
        //updatelayer () -- update layer features
        /*==========================================*/
        this.updateLayer = function(element, index, array) {
                //is the element a category or basemap??
                if (element.hasOwnProperty('kind')) {
                    if (debug) console.log(this.mapData[0], element.getSource(), element.getRevision(), this.mapData[0], this.mapData[0].vectorSource(), element.getProperties());
                    if (element.hasOwnProperty('tmid')) {
                        if (this.mapData[element.tmid].visible) {
                            element.setSource(this.mapData[element.tmid].vectorSource());
                        } else {
                            element.setSource(null);
                        }
                    }
                }

            }
            /*==========================================*/
            //moveToPoint() -- pans map to inputted ol.point coords and displays html
            /*==========================================*/
        this.moveToPoint = function(location, html) {
          if (debug) console.log(location);
          //validate input
          if (Array.isArray ( location ) ) {
            // var  = ol.proj.transform(latlon, 'EPSG:4326', 'EPSG:3857');
            // bounce by zooming out one level and back in
            var bounce = ol.animation.bounce({
                resolution: this.m.getView().getResolution() * 2
            });
            // start the pan at the current center of the map
            var pan = ol.animation.pan({
                source: this.m.getView().getCenter()
            });
            this.m.beforeRender(bounce);
            this.m.beforeRender(pan);
            // when we set the center to the new location, the animated move will
            // trigger the bounce and pan effects
            this.m.getView().setCenter(location);
            /*
            Display marker description box
            */
            var markerPixel = this.m.getPixelFromCoordinate(location)
            var feature = this.m.forEachFeatureAtPixel(markerPixel,
                function(feature, layer) {
                    return feature;
                });
        if(debug)    console.log(feature);
            if (feature) {
                popup.setPosition(location);
                $(element).popover({
                    'placement': 'top',
                    'html': true,
                    'content': html
                });
                $(element).popover('show');
            } else {
                $(element).popover('destroy');
            }
          }
        };
        /*==========================================*/
        //update() -- redraws map
        /*==========================================*/
        this.update = function() {
            //should a layer or layer object be displayed???
            this.mapObjects.forEach(this.updateLayer, this);
            this.m.render(); //redraw
        };
        /*
        toggleCategories()
        Hides invisible layers
        */
        this.toggleCategories = function() {
            //update visible or invisible categories
            if ((timemap_instance.hasOwnProperty('visibleCategories')) || (timemap_instance.hasOwnProperty('hiddenCategories'))) {
                for (var i = timemap_instance.visibleCategories.length - 1; i >= 0; i--) {
                    var getValue = timemap_instance.visibleCategories[i];
                    var n = Number(getValue[0]);
                    this.mapData[n].visible = true;
                    if (debug) console.log(this.mapData[n]);

                };
                for (var i = timemap_instance.hiddenCategories.length - 1; i >= 0; i--) {
                    var getValue = timemap_instance.hiddenCategories[i];
                    var n = Number(getValue[0]);
                    this.mapData[n].visible = false;
                    if (debug) console.log(this.mapData[n]);
                };
                //reset arrays
                timemap_instance.hiddenCategories = [];
                timemap_instance.visibleCategories = [];
            }
            this.update();
        };
        // display popup on click
        this.m.on('click', function(evt) {
            var feature = this.m.forEachFeatureAtPixel(evt.pixel,
                function(feature, layer) {
                    return feature;
                });
            if (feature) {
                popup.setPosition(evt.coordinate);
                $(element).popover({
                    'placement': 'top',
                    'html': true,
                    'content': feature.get('html')
                });
                $(element).popover('show');
            } else {
                $(element).popover('destroy');
            }
        }, this);

        // change mouse cursor when over marker
        this.m.on('pointermove', function(e) {
            if (e.dragging) {
                $(element).popover('destroy');
                return;
            }
            var pixel = this.m.getEventPixel(e.originalEvent);
            var hit = this.m.hasFeatureAtPixel(pixel);
            this.m.getTarget().style.cursor = hit ? 'pointer' : '';
        }, this);
        this.m.addOverlay(popup);
    }
}
