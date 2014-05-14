/*
 *  Transports Manager
 */
var TransportsManager = function(map) {
	var stations = null;
	// Set structure for keeping track of currently displayed path layers
	var enabledLayers = new buckets.Set();

	var MetrobusDom = 'metrobus';
	var MetroDom = 'metro';
	var SuburbanoDom = 'trensuburbano';
	var STEDom = 'transporteselectricos';
	var MexibusDom = 'mexibus';
	var itdpDom = 'itdp';

	var metrobus = null;
	var metro = null;
	var suburbano = null;
	var electricos = null;
	var mexibus = null;
	var itdp = null;
	var thisInstance = this;

	/*
	 *   Private function: toggleStationsFor
	 *
	 *   Draws or clears the stations points defined in the given string layerStr parameter
	 */
	var toggleStationsFor = function(layerStr) {
		
		if(enabledLayers.contains(layerStr)) {
			enabledLayers.remove(layerStr);
		} else {
			enabledLayers.add(layerStr);
		}

		if(stations != null) {
			map.removeLayer(stations);
		}
		// Add vector data to map
	  stations = L.geoJson(allStations, {
			style: {
				weight: 0.1,
				color: 'transparent'
			},
			pointToLayer: function (feature, latlng) {
           return new L.CircleMarker(latlng, {
               radius: 5,
               fillColor: "transparent",
               color: "transparent",
               weight: 1,
               opacity: 1,
               fillOpacity: 1
           });
       },
	    onEachFeature: function (feature, layer) {
					layer.bindPopup("<p style='margin-top: 10px !important; margin-bottom: 0px !important; font-size: 13px'>"+feature.properties.stop_name+"</p>");
			},
			filter: function(feature, layer) {
				return thisInstance.isTransportEnabled(feature.properties.agency_id);
			}
	  });

		if(enabledLayers.size() > 0) {
			map.addLayer(stations);
		}
	}

	/*
	 *   Private function: togglePathLayerFor
	 *
	 *   Adds or removes a *layer* from the map and adds or removes
	 *   a the class selected to the given dom element
	 */
	var togglePathLayerFor = function(layer, dom) {
		if (map.hasLayer(layer)) {
        map.removeLayer(layer);
				$('#'+dom).parent().parent().removeClass('selected');
    } else {
        map.addLayer(layer);
				$('#'+dom).parent().parent().addClass('selected');
    }
	}

	/*
	 *   Private functions: toggle*
	 *   Loads and sets (if not yet set) the layer which includes the lines paths for the given transport
	 *	 then adds/removes the path
	 *   and shows/hides the stations that are part of each transporte line
	 */

	var toggleSuburbano = function() {
		if(suburbano == null) {
			suburbano = L.mapbox.tileLayer('vidriloco.lypnteuc');
		}

		togglePathLayerFor(suburbano, SuburbanoDom);
		toggleStationsFor('SUB');
	}

	var toggleMetro = function() {
		if(metro == null) {
			metro = L.mapbox.tileLayer('vidriloco.xeh1mnlr');
		}

		togglePathLayerFor(metro, MetroDom);
		toggleStationsFor('METRO');
	}

	var toggleMetrobus = function() {
		if(metrobus == null) {
			metrobus = L.mapbox.tileLayer('vidriloco.nrr1yo7v');
		}

		togglePathLayerFor(metrobus, MetrobusDom);
		toggleStationsFor('MB');
	}

	var toggleSTE = function() {
		if(electricos == null) {
			electricos = L.mapbox.tileLayer('vidriloco.3vgjbd6g');
		}

		togglePathLayerFor(electricos, STEDom);
		toggleStationsFor('STE');
	}

	var toggleMexibus = function() {
		if(mexibus == null) {
			mexibus = L.mapbox.tileLayer('vidriloco.jxwkt7sa');
		}

		togglePathLayerFor(mexibus, MexibusDom);
		toggleStationsFor('Mexibus');
	}

	var toggleITDP = function() {
		if(itdp == null) {
			itdp = L.mapbox.tileLayer('spalatin.jbxehglj');
		}

		togglePathLayerFor(itdp, itdpDom);
		toggleStationsFor('ITDP');
	}

	/*
	 *  Public function: toggle
	 *
	 *  Enables the transport layers (stations and paths) for the
	 *  passed public transportation service (layerDom)
	 */
	this.toggle = function(layerDom) {
		if(layerDom == MetrobusDom) {
			toggleMetrobus();
		} else if(layerDom == MetroDom) {
			toggleMetro();
		} else if(layerDom == SuburbanoDom) {
			toggleSuburbano();
		} else if(layerDom == STEDom) {
			toggleSTE();
		} else if(layerDom == MexibusDom) {
			toggleMexibus();
		} else if(layerDom == itdpDom) {
			toggleITDP();
		}
	}

	/*
	 *  Public function: isTransportEnabled
	 */

	this.isTransportEnabled = function(transport) {
		return enabledLayers.contains(transport);
	}

}

/*
 *   Polygons Manager
 */
var PolygonsManager = function(map, tm, callback) {
	var agebsVector = null;
	var agebsLayer = null;

	var transportsManager = tm;
	var coloringManager = null;
	var currentRadius = null;
	var radiusDict = {};

	var initialize = function(callback_fnc) {
		coloringManager = new ColoringRanges();
		if(callback_fnc != null) {
			callback_fnc();
		}
	}

	var clearFields = function() {
		$('#ageb_population').html('--');
		$('#ageb_houses').html('--');
		$('#ageb_density').html('--');

		$('#ageb_population_with_job').html('--');
		$('#ageb_population_without_job').html('--');
		$('#ageb_population_handicap').html('--');
		$('#ageb_population_with_car').html('--');
		$('#ageb_houses_empty').html('--');

		$('#ageb_socioeconomic_level').html('--');
		$('#ageb_margination').html('--');
	}

	var filterByAgency = function(feature, layer) {
		var name = null;
		var agency = (feature.properties.AGENCIA || feature.properties.Agencia);
		
		if(agency == "Tren Suburbano") {
			name = "SUB";
		} else if(agency == "Metrobús") {
			name = "MB";
		} else if(agency == "Sistema de Transporte Colectivo") {
			name = "METRO";
		} else if(agency == "Mexibús") {
			name = "Mexibus";
		} else {
      name = agency;
    }
		return transportsManager.isTransportEnabled(name);
	}
	
	var loadRadius = function(radius) {
		if(radiusDict[radius] != null) {
			map.removeLayer(radiusDict[radius]);
		}
		var radiusLayer = null
		if(radius == 500) {
			radiusLayer = radius500;	    
		} else if(radius == 800) {
			radiusLayer = radius800;	    
		} else if(radius == 1000) {
			radiusLayer = radius1000;	    
		} else if(radius == 2000) {
			radiusLayer = radius2000;	    
		} else {
			radiusLayer = agebs;	    
		}
		
		var geoJsonObj = {
			style: coloringManager.colorForValueOnCurrentFeature,
    	onEachFeature: onEachFeature
		};
		
		if(radiusLayer != agebs) {
			geoJsonObj.filter = filterByAgency;
		}

		radiusDict[radius] = L.geoJson(radiusLayer, geoJsonObj);

		currentRadius = radius;
    map.addLayer(radiusDict[radius]);
	}

  this.redrawActiveLayer = function() {
    _redrawActiveLayer();
  }

	var _redrawActiveLayer = function() {
		if(currentRadius == null) {
      return;
    }

		loadRadius(currentRadius);
	}

	var assignStats = function(feature) {

		$('#ageb_population').html(feature.properties.pob1 || '--');
		$('#ageb_houses').html(feature.properties.viv0 || '--');
		$('#ageb_density').html(feature.properties.densidad || '--');

		$('#ageb_population_with_job').html("% "+new Number(feature.properties.eco4_r).toPrecision(3) || '--');
		$('#ageb_population_without_job').html("% "+new Number(feature.properties.eco25_r).toPrecision(3) || '--');
		$('#ageb_population_handicap').html("% "+new Number(feature.properties.disc_r).toPrecision(3) || '--');

		if(feature.properties.viv28_r != undefined) {
			$('#ageb_population_with_car').html("% "+new Number(feature.properties.viv28_r).toPrecision(3) || '--');
		} else {
			$('#ageb_population_with_car').html('--');
		}

		if(feature.properties.viv1_r != undefined) {
			$('#ageb_houses_empty').html("% "+new Number(feature.properties.viv1_r).toPrecision(3) || '--');
		} else {
			$('#ageb_houses_empty').html('--');
		}

		var margination = null;
		if(feature.properties.nse == 'C_menos' || feature.properties.nse == 'C_me') {
			margination = "C -";
		} else if(feature.properties.nse == "D_me") {
			margination = "D -";
		} else if(feature.properties.nse == "D_mas") {
			margination = "D +";
		} else if(feature.properties.nse == "C_mas") {
			margination = "C +";
		} else {
			margination = feature.properties.nse;
		}

		$('#ageb_socioeconomic_level').html(margination || '--');
		$('#ageb_margination').html(feature.properties.gmu || '--');
	}

	var highlightFeature = function(e) {
			var highlightedFeature = e.target;
			assignStats(e.target.feature);
			
			highlightedFeature.setStyle(coloringManager.highlightedColor());
	}

	var deHighlightFeature = function(e) {
		var highlightedFeature = e.target;
		highlightedFeature.setStyle(coloringManager.deHighlightedColor());
	}

  var onEachFeature = function(feature, layer) {
    layer.on({
			mouseover: highlightFeature,
			mouseout: deHighlightFeature
    });

		var agency = (feature.properties.AGENCIA || feature.properties.Agencia);
		if(agency != undefined && feature.properties.Name != undefined) {
			layer.bindPopup("<p style='margin-top: 10px !important; margin-bottom: 0px !important; font-size: 13px'> "+$('#transport-radius').html()+'<b>'+agency+"</b> - "+feature.properties.Name+"</p>");
		}
  }

	var removeCurrentRadius = function() {
		if(currentRadius != null) {
			map.removeLayer(radiusDict[currentRadius]);
			currentRadius = null;
		}
	}

	var enablePanelsForRadius = function() {
		$('.radius-list .action').removeClass('hidden');
		$('#stats-panel').removeClass('hidden');
		$('.polygons-enabler-off').removeClass('hidden');
		$('.polygons-enabler-on').addClass('hidden');
	}
	
	this.setMapColoringTo = function(domElement) {
		coloringManager.setSelectedAspect(domElement);
		_redrawActiveLayer();
	}
	
	this.resetMapColoring = function() {
		coloringManager.reset();
		_redrawActiveLayer();
	}
	
	this.tableRangeForCurrentAspect = function() {
		return coloringManager.tableRangeForAspect();
	}

	this.disablePanelsForRadius = function(hideAllEnablers) {
		map.removeLayer(radiusDict[currentRadius]);
		$('#stats-panel').addClass('hidden');
		$('.radius-list .action').addClass('hidden');
		$('.polygons-enabler-off').addClass('hidden');
		if(hideAllEnablers) {
			$('.polygons-enabler-on').addClass('hidden');
		} else {
			$('.polygons-enabler-on').removeClass('hidden');
		}
	}

	this.reenablePanelsForRadius = function() {
		if(currentRadius != null) {
			map.addLayer(radiusDict[currentRadius]);
		}
		$('#stats-panel').removeClass('hidden');
		$('.radius-list .action').removeClass('hidden');
		$('.polygons-enabler-off').removeClass('hidden');
		$('.polygons-enabler-on').addClass('hidden');
	}

	this.showRadiusPanel = function(number) {
		enablePanelsForRadius();
		clearFields();
		removeCurrentRadius();
		
		loadRadius(number);
		$('.polygons-enabler').removeClass('hidden');
	}

	initialize(callback);
}

var ColoringRanges = function() {
	var selectedAspect = null;
	var lastStyleUsed = null;
	
	var defaultStyle = {
      weight: 2,
			color: '#A4D1FF',
      fillColor: '#A4D1FF',
      dashArray: '',
      fillOpacity: 0.05
  };

	var highlightedStyle = {
      weight: 2,
			color: '#4886FF',
      fillColor: '#4886FF',
      dashArray: '',
      fillOpacity: 0.3
  };

	var heatStyle = {
		weight: 0.5,
		color: 'white',
		dashArray: '',
		fillOpacity: 0.5
	}

	this.colorForValueOnCurrentFeature = function(feature) {
		var fillColor = null;
		
		if (selectedAspect == 'ageb_population-aspect') {
			var value = parseFloat(feature.properties.pob1);
		} else if (selectedAspect == 'ageb_houses-aspect') {
			var value = parseFloat(feature.properties.viv0);

			fillColor = value > 15000 ? colors.darkRed : 
						 value > 7000  ? colors.red :
						 value > 3000  ? colors.orange :
						 value > 1500  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_density-aspect') {
			var value = parseFloat(feature.properties.densidad);

			fillColor = value > 200 ? colors.darkRed : 
						 value > 90  ? colors.red :
						 value > 30  ? colors.orange :
						 value > 20  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_population_with_job-aspect') {
			var value = parseFloat(feature.properties.eco4_r);

			fillColor = value >= 9 ? colors.darkRed : 
						 value >= 7  ? colors.red :
						 value >= 5  ? colors.orange :
						 value >= 3  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_population_without_job-aspect') {
			var value = parseFloat(feature.properties.eco25_r);

			fillColor = value >= 9 ? colors.darkRed : 
						 value >= 7  ? colors.red :
						 value >= 5  ? colors.orange :
						 value >= 3  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_population_handicap-aspect') {
			var value = parseFloat(feature.properties.disc_r);

			fillColor = value > 6 ? colors.darkRed : 
						 value > 4  ? colors.red :
						 value > 3  ? colors.orange :
						 value > 1  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_population_with_car-aspect') {
			var value = parseFloat(feature.properties.viv28_r);

			fillColor = value > 80 ? colors.darkRed : 
						 value > 60  ? colors.red :
						 value > 40  ? colors.orange :
						 value > 20  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_houses_empty-aspect') {
			var value = parseFloat(feature.properties.viv1_r);

			fillColor = value > 50 ? colors.darkRed : 
						 value > 30  ? colors.red :
						 value > 20  ? colors.orange :
						 value > 10  ? colors.yellow : colors.yellowPale;
		} else if (selectedAspect == 'ageb_socioeconomic_level-aspect') {
			var value = feature.properties.nse;
			fillColor = /E/.test(value) ? colors.darkRed : 
						 /(D_menos|D_me|D_mas)/.test(value)  ? colors.red :
						 /(C_menos|C_me|C_mas)/.test(value)  ? colors.orange :
						 /A/.test(value)  ? colors.yellow : colors.yellowPale;
		}	else if (selectedAspect == 'ageb_margination-aspect') {
			var value = feature.properties.gmu;

			fillColor = /Muy Alto/.test(value) ? colors.darkRed : 
						 /Alto/.test(value)  ? colors.red :
						 /Medio/.test(value)  ? colors.orange :
						 /Bajo/.test(value)  ? colors.yellow : colors.yellowPale;
		} else {
			return defaultStyle;
		}

		// Set the color on heat style
		heatStyle.fillColor = fillColor;
		lastStyleUsed = heatStyle;
		return lastStyleUsed;
	};
	
	this.tableRangeForAspect = function() {
		
		if (selectedAspect == 'ageb_population-aspect') {
			return {
				yellowPale: '',
				yellow: '',
				orange: '',
				red: '',
				darkRed: ''
			}
		} else if (selectedAspect == 'ageb_houses-aspect') {
			return {
				yellowPale: '',
				yellow: '',
				orange: '',
				red: '',
				darkRed: ''
			}
		} else if (selectedAspect == 'ageb_density-aspect') {
			return {
				yellowPale: '0 - 20',
				yellow: '21 - 30',
				orange: '31 - 90',
				red: '91 - 200',
				darkRed: '+ 201'
			}
		} else if (selectedAspect == 'ageb_population_with_job-aspect' || selectedAspect == 'ageb_population_without_job-aspect') {
			return {
				yellowPale: '0 - 2 %',
				yellow: '3 - 4 %',
				orange: '5 - 6 %',
				red: '7 -8 %',
				darkRed: '9 - 10 %'
			}	
		} else if (selectedAspect == 'ageb_population_handicap-aspect') {
			return {
				yellowPale: '0 - 1 %',
				yellow: '2 - 3 %',
				orange: '4 %',
				red: '5 %',
				darkRed: '+ 6 %'
			}
		} else if (selectedAspect == 'ageb_population_with_car-aspect') {
			return {
				yellowPale: '0 - 20 %',
				yellow: '21 - 40 %',
				orange: '41 - 60 %',
				red: '61 - 80 %',
				darkRed: '81 - 100 %'
			}
		} else if (selectedAspect == 'ageb_houses_empty-aspect') {
			return {
				yellowPale: '0 - 10',
				yellow: '11 - 20',
				orange: '21 - 30',
				red: '31 - 50',
				darkRed: '51 - 70'
			}
		} else if (selectedAspect == 'ageb_socioeconomic_level-aspect') {
			return {
				yellowPale: 'A - AB',
				yellow: 'B',
				orange: 'C + , C-',
				red: 'D +, D-',
				darkRed: 'E'
			}
		}	else if (selectedAspect == 'ageb_margination-aspect') {
			return {
				yellowPale: 'Muy Bajo',
				yellow: 'Bajo',
				orange: 'Medio',
				red: 'Alto',
				darkRed: 'Muy Alto'
			}
		} else {
			return {};
		}

		// Set the color on heat style
		heatStyle.fillColor = fillColor;
		lastStyleUsed = heatStyle;
		return lastStyleUsed;
	};
	
	this.highlightedColor = function() {
			if(lastStyleUsed != null) {				
				return {
					weight: 2,
					color: 'black',
				};
			} else {
	    	return highlightedStyle;
			}
	}
	
	this.deHighlightedColor = function() {
		if(lastStyleUsed != null) {
			return {
				weight: 0.5,
				color: 'white'
			};
		} else {
			return defaultStyle;
		}
	}
	
	this.setSelectedAspect = function(aspect) {
		selectedAspect = aspect;
	}
	
	this.reset = function() {
		lastStyleUsed = null;
		selectedAspect = null;
	}
	
	var colors = {
		yellowPale: '#FFE178',
		yellow: '#FFAC00',
		orange: '#FF7A00',
		red: '#FF2A00',
		darkRed: '#AB1C00'
	};
	
	var initialize = function() {
		
	}
}
