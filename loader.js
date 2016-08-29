var app_id   =  '';
var app_code = '';

var platform = new H.service.Platform({
	app_id: app_id,
	app_code: app_code,
	useCIT: true,
	useHTTPS: true
});

var defaultLayers = platform.createDefaultLayers();

var map = window.map;
var behavior = window.behavoir;
var ui = window.ui;

function mapLoad(element) {
	window.map = new H.Map(element, defaultLayers.normal.map); 
	window.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
	window.ui = H.ui.UI.createDefault(map, defaultLayers);
}

function setMapToUserLocation() {

	var success = function (position) {
		map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
		map.setZoom(14);
	}

	var error = function () {
		map.setCenter({ lat: -14.7853034, lng: -56.5342851 });
		map.setZoom(4);
	}

	navigator.geolocation.getCurrentPosition(success, error);
}

function formatSearchQuery(searchText, country) {
	var url = "http://geocoder.cit.api.here.com/6.2/geocode.json?app_id=" + app_id + "&app_code=" + app_code + "&country=" + country + "&searchtext=" + searchText;
	return url;
}

function formatReverseGeocodeSearchQuery(latLong) {
	var url = "http://reverse.geocoder.cit.api.here.com/6.2/reversegeocode.json?app_id=" + app_id + "&app_code=" + app_code + "&gen=10&prox="+ latLong +",100&mode=retrieveAddresses";
	return url;
}

function searchAddress(id){
	jQuery(id).autocomplete({			
			source: function(request, resolve) {	
				//se houver letras na busca do usuário busca por endereço, senão busca por latitude
				if(tem_letras(request.term)==1){	
					//qtd de virgula for maior ou igual a 2
					if(substr_count(request.term, ",")>=2){
						//pesquisa endereco no here
						jQuery.getJSON( formatSearchQuery(request.term, "Brazil"), function(data) {
							resultado = new Array();
							if (data.Response.View.length > 0) {
								for (index in data.Response.View[0].Result) {
									var item = data.Response.View[0].Result[index];									
									var endereco = {
								    	enderecoCompleto: item.Location.Address.Label,
								    	logradouro: item.Location.Address.Street,
								    	numero: item.Location.Address.HouseNumber,
								    	bairro: item.Location.Address.District,
								    	cidade: item.Location.Address.City,
								    	estado: item.Location.Address.AdditionalData[1].value,
								    	uf: item.Location.Address.State,
								    	cep: item.Location.Address.PostalCode,
								    	latitude: item.Location.DisplayPosition.Latitude, 
								    	longitude: item.Location.DisplayPosition.Longitude
								    }; 					 											
									var dados = {
										label: item.Location.Address.Label,
										value: endereco
									};
									resultado.push(dados);																																																
								}
								resolve(resultado);
							 }else{
							 	//se nao acha endereco no here pesquisa no google
							 	jQuery.getJSON( formatSearchQueryGoogle(request.term, "Brazil"), function(data) {					 		
							 		if(data.status == 'OK'){								 		
								 		for (index in data.results) {			 									 			
								 			var item = data.results[index];
								 			var endereco = formatResultsGoogle(item);
								 			var dados = {
												label: item.formatted_address,
												value: endereco
											};
								 			resultado.push(dados);			
								 		}					 			
									}
									resolve(resultado);
							 	});
							 }	
						});	
					}else{
						//enquanto o usuario não digitar a cidade exibe esta mensagem
						var dados = {
							label:"Informe o endereço no formato Logradouro, número, cidade, estado.",
							value: 1
						};
						resolve(dados);
					}							
				}else{
					//Pesquisa por Latlong
					//verifica se existe uma virgula separando latlong
					if(substr_count(request.term, ",")>=1){
						jQuery.getJSON( formatReverseGeocodeSearchQuery(request.term), function(data) {
							resultado = new Array();
							if (data.Response.View.length > 0) {
								for (index in data.Response.View[0].Result) {
									var item = data.Response.View[0].Result[index];									
									var endereco = {
								    	enderecoCompleto: item.Location.Address.Label,
								    	logradouro: item.Location.Address.Street,
								    	numero: item.Location.Address.HouseNumber,
								    	bairro: item.Location.Address.District,
								    	cidade: item.Location.Address.City,
								    	estado: item.Location.Address.AdditionalData[1].value,
								    	uf: item.Location.Address.State,
								    	cep: item.Location.Address.PostalCode,
								    	latitude: item.Location.DisplayPosition.Latitude, 
								    	longitude: item.Location.DisplayPosition.Longitude
								    }; 					 											
									var dados = {
										label: item.Location.Address.Label,
										value: endereco
									};
									resultado.push(dados);																																																
								}
								resolve(resultado);
							}
						});
					}else{
						//enquanto usuario não digita a longitude exibe esta mensagem
						var dados = {
								label:"Informe a latitude e longitude. Exemplo:-14.7853034,-56.5342851",
								value: 1
							};
						resolve(dados);
					}
				}
						
			},
			//https://api.jqueryui.com/autocomplete/#event-select
			select: function( event, ui ) { 
				
			},
			minLength: 5
		});
}


function limparPontos(searchMarker){
	map.removeObjects(searchMarker);
}

function routing(waypoints){
	var routing = "https://route.cit.api.here.com/routing/7.2/calculateroute.json?app_id="+app_id+"&app_code="+app_code+"&"+waypoints+"&mode=fastest;car;traffic:disabled";
	return routing;	
}

function matrix(waypoints){
	/*var matrix =  "https://matrix.route.cit.api.here.com/routing/7.2/calculatematrix.json?app_id={YOUR_APP_ID}
	&app_code={YOUR_APP_CODE}
	&start0=52.5,13.4
	&destination0=52.5,13.43
	&destination1=52.5,13.46
	&mode=fastest;car;traffic:disabled";*/
	//&waypoint0=geo!-22.5022399,-43.2210501&waypoint1=geo!-23.53029,-46.70458&waypoint2=geo!-23.53029,-46.70458&waypoint3=geo!-23.6009,-46.63991
}

function findSequence(waypoints){
	var url = "https://wse.cit.api.here.com/2/findsequence.json?"+waypoints+"&improveFor=time&mode=fastest%3Bcar&app_id="+app_id+"&app_code="+app_code;
	return jQuery.ajax({
		type: 'GET',
		url: url,
		dataType: "jsonp",
		jsonp: 'jsonCallback',
		success: function (response) {
			
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//console.log(XMLHttpRequest);
		}
	});		
}



function calculateRouteHere(routingParameters) {  
  //console.log(routingParameters);

  var myJSONData = '';
  jQuery.each(routingParameters, function( index, value ) {
	myJSONData += index+"="+value+"&";		  
  });

  myJSONData = myJSONData.substring(0, (myJSONData.length-1));
  
  //console.log(myJSONData);
  //representation na url serve para mostrar o shape para o mapa
  return jQuery.ajax({
    type: 'POST',    
    url: 'https://route.api.here.com/routing/7.2/calculateroute.json?app_id=' + app_id + '&app_code=' + app_code + '&representation=display&mode=fastest;car;traffic:disabled',
    data: myJSONData,
    contentType: 'text/plain',
    success: function(data) {    	   	
      //jQuery('#output').html('<h1>Response:</h1>' + JSON.stringify(data));
    },
    error: function(jqXHR, textStatus, errorThrown) {
      //jQuery('#output').html('<h1>Error:</h1>' + textStatus + " " + errorThrown);
    }
  }); // Ajax Call
}

//função para definir a cerca virtual
function setUpCustomZooming(map) {
  // create several circles to denote cities' population
  var clevelandCircle = new H.map.Circle(
    new H.geo.Point(41.4822, -81.6697), //center
    11703, // Radius proportional to 390,113 population
    {style: {fillColor: 'rgba(0, 255, 221, 0.66)'}}
  );
  var torontoCircle = new H.map.Circle(
    new H.geo.Point(43.7000, -79.4000), //center
    75090, // Radius proportional to 2.503 million population
    {style: {fillColor: 'rgba(0, 255, 221, 0.66)'}}
  );
  var chicagoCircle = new H.map.Circle(
    new H.geo.Point(41.8369, -87.6847), //center
    81570, // Radius proportional to 2.719 million population
    {style: {fillColor: 'rgba(0, 221, 255, 0.66)'}}
  );
  var newYorkCircle = new H.map.Circle(
    new H.geo.Point(40.7127, -74.0059), //center
    252180, // Radius proportional to 8.406 million population
    {style: {fillColor: 'rgba(221, 0, 255, 0.66)'}}
  );
  // define maximum zoom level for each circle
  clevelandCircle.setData({maxZoom: 7});
  torontoCircle.setData({maxZoom: 5});
  chicagoCircle.setData({maxZoom: 5});
  newYorkCircle.setData({maxZoom: 4});

  // create container for objects
  var container = new H.map.Group({
    objects: [clevelandCircle, torontoCircle, chicagoCircle, newYorkCircle]
  });

  // use the event delegation to handle 'tap' events on objects
  container.addEventListener('tap', function (evt) {
    var target = evt.target;
    // retrieve maximum zoom level
    var maxZoom = target.getData().maxZoom;
    // calculate best camera data to fit object's bounds
    var cameraData = map.getCameraDataForBounds(target.getBounds());

    // we set new zoom level taking into acount 'maxZoom' value
    map.setZoom(Math.min(cameraData.zoom, maxZoom), true);
    map.setCenter(cameraData.position, true);
  });

  // add objects to the map
  map.addObject(container);
}

//função para definir a cerca virtual
function setUpCustomZooming(map) {
  // create several circles to denote cities' population
  var clevelandCircle = new H.map.Circle(
    new H.geo.Point(41.4822, -81.6697), //center
    11703, // Radius proportional to 390,113 population
    {style: {fillColor: 'rgba(0, 255, 221, 0.66)'}}
  );
  var torontoCircle = new H.map.Circle(
    new H.geo.Point(43.7000, -79.4000), //center
    75090, // Radius proportional to 2.503 million population
    {style: {fillColor: 'rgba(0, 255, 221, 0.66)'}}
  );
  var chicagoCircle = new H.map.Circle(
    new H.geo.Point(41.8369, -87.6847), //center
    81570, // Radius proportional to 2.719 million population
    {style: {fillColor: 'rgba(0, 221, 255, 0.66)'}}
  );
  var newYorkCircle = new H.map.Circle(
    new H.geo.Point(40.7127, -74.0059), //center
    252180, // Radius proportional to 8.406 million population
    {style: {fillColor: 'rgba(221, 0, 255, 0.66)'}}
  );
  // define maximum zoom level for each circle
  clevelandCircle.setData({maxZoom: 7});
  torontoCircle.setData({maxZoom: 5});
  chicagoCircle.setData({maxZoom: 5});
  newYorkCircle.setData({maxZoom: 4});

  // create container for objects
  var container = new H.map.Group({
    objects: [clevelandCircle, torontoCircle, chicagoCircle, newYorkCircle]
  });

  // use the event delegation to handle 'tap' events on objects
  container.addEventListener('tap', function (evt) {
    var target = evt.target;
    // retrieve maximum zoom level
    var maxZoom = target.getData().maxZoom;
    // calculate best camera data to fit object's bounds
    var cameraData = map.getCameraDataForBounds(target.getBounds());

    // we set new zoom level taking into acount 'maxZoom' value
    map.setZoom(Math.min(cameraData.zoom, maxZoom), true);
    map.setCenter(cameraData.position, true);
  });

  // add objects to the map
  map.addObject(container);
}

function setUpCustomZooming(map) {
  // create several circles to denote cities' population
  var clevelandCircle = new H.map.Circle(
    new H.geo.Point(41.4822, -81.6697), //center
    11703, // Radius proportional to 390,113 population
    {style: {fillColor: 'rgba(0, 255, 221, 0.66)'}}
  );
  var torontoCircle = new H.map.Circle(
    new H.geo.Point(43.7000, -79.4000), //center
    75090, // Radius proportional to 2.503 million population
    {style: {fillColor: 'rgba(0, 255, 221, 0.66)'}}
  );
  var chicagoCircle = new H.map.Circle(
    new H.geo.Point(41.8369, -87.6847), //center
    81570, // Radius proportional to 2.719 million population
    {style: {fillColor: 'rgba(0, 221, 255, 0.66)'}}
  );
  var newYorkCircle = new H.map.Circle(
    new H.geo.Point(40.7127, -74.0059), //center
    252180, // Radius proportional to 8.406 million population
    {style: {fillColor: 'rgba(221, 0, 255, 0.66)'}}
  );
  // define maximum zoom level for each circle
  clevelandCircle.setData({maxZoom: 7});
  torontoCircle.setData({maxZoom: 5});
  chicagoCircle.setData({maxZoom: 5});
  newYorkCircle.setData({maxZoom: 4});

  // create container for objects
  var container = new H.map.Group({
    objects: [clevelandCircle, torontoCircle, chicagoCircle, newYorkCircle]
  });

  // use the event delegation to handle 'tap' events on objects
  container.addEventListener('tap', function (evt) {
    var target = evt.target;
    // retrieve maximum zoom level
    var maxZoom = target.getData().maxZoom;
    // calculate best camera data to fit object's bounds
    var cameraData = map.getCameraDataForBounds(target.getBounds());

    // we set new zoom level taking into acount 'maxZoom' value
    map.setZoom(Math.min(cameraData.zoom, maxZoom), true);
    map.setCenter(cameraData.position, true);
  });

  // add objects to the map
  map.addObject(container);
}

//Adicionar mais de um marcador e centraliza-los no mapa
function addMarkersAndSetViewBounds() {
  // create map objects
  var toronto = new H.map.Marker({lat:43.7,  lng:-79.4}),
      boston = new H.map.Marker({lat:42.35805, lng:-71.0636}),
      washington = new H.map.Marker({lat:38.8951, lng:-77.0366}),
      group = new H.map.Group();

  // add markers to the group
  group.addObjects([toronto, boston, washington]);
  map.addObject(group);

  // get geo bounding box for the group and set it to the map
  map.setViewBounds(group.getBounds());
}