$(document).ready(function(){
  
  var element = document.getElementById('mapa');
  //alert(element);
  mapLoad(element);
  //setMapToUserLocation();
// Code goes here
var dataPoints = [];
dataPoints.push(new H.clustering.DataPoint(51.01, 0.01));
dataPoints.push(new H.clustering.DataPoint(50.04, 1.01));
dataPoints.push(new H.clustering.DataPoint(51.45, 1.01));
dataPoints.push(new H.clustering.DataPoint(51.01, 2.01));

var dataPoints2 = [];
dataPoints2.push(new H.clustering.DataPoint(-23.533773, -46.625290));
dataPoints2.push(new H.clustering.DataPoint(-23.533773, -46.625290));
dataPoints2.push(new H.clustering.DataPoint(-23.533773, -46.625290));
dataPoints2.push(new H.clustering.DataPoint(-23.533773, -46.625290));

var dataPoints3 = [];
dataPoints3.push(new H.clustering.DataPoint(53.01, 0.01));
dataPoints3.push(new H.clustering.DataPoint(54.04, 1.01));
dataPoints3.push(new H.clustering.DataPoint(55.45, 1.01));
dataPoints3.push(new H.clustering.DataPoint(56.01, 2.01));

var colorPai1 = 'green';
var colorFilho1 = 'blue';
var colorPai2 = 'yellow';
var colorFilho2 = 'red';

var clusteredDataProvider1 = teste(dataPoints, colorPai1, colorFilho1);
var clusteredDataProvider2 = teste(dataPoints2, colorPai2, colorFilho2);

// Create a layer that includes the data provider and its data points: 
var layer = new H.map.layer.ObjectLayer(clusteredDataProvider1);
var layer = new H.map.layer.ObjectLayer(clusteredDataProvider2);

// Add the layer to the map:
map.addLayer(layer);

});

function teste(dataPoints, colorPai, colorFilho){
  // SVG template to use for noise icons
var noiseSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px"><circle cx="5px" cy="5px" r="5px" fill="'+colorFilho+'" /></svg>';

// Create an icon to represent the noise points
// Note that same icon will be used for all noise points
var noiseIcon = new H.map.Icon(noiseSvg, {
  size: { w: 20, h: 20 },
  anchor: { x: 10, y: 10},
  });

// SVG template to use for cluster icons
var clusterSvgTemplate = '<svg xmlns="http://www.w3.org/2000/svg" height="{diameter}" width="{diameter}">' +
  '<circle cx="{radius}px" cy="{radius}px" r="{radius}px" fill="'+colorPai+'" />' +
  '</svg>';
  // Create a clustered data provider and a theme implementation
return clusteredDataProvider = new H.clustering.Provider(dataPoints, {
  theme: {
    getClusterPresentation: function(cluster) {
    // Use cluster weight to change the icon size
    var weight = cluster.getWeight(),
      // Calculate circle size
      radius = weight * 5,
      diameter = radius * 2,

      // Replace variables in the icon template
      svgString = clusterSvgTemplate.replace(/\{radius\}/g, radius).replace(/\{diameter\}/g, diameter);

      // Create an icon
      // Note that we create a different icon depending from the weight of the cluster
      clusterIcon = new H.map.Icon(svgString, {
      size: {w: diameter, h: diameter},
      anchor: {x: radius, y: radius}
      }),

      // Create a marker for the cluster
      clusterMarker = new H.map.Marker(cluster.getPosition(), {
      icon: clusterIcon,

      // Set min/max zoom with values from the cluster, otherwise
      // clusters will be shown at all zoom levels
      min: cluster.getMinZoom(),
      max: cluster.getMaxZoom()
      });

    // Bind cluster data to the marker
    clusterMarker.setData(cluster);

    return clusterMarker;
    },
  getNoisePresentation: function(noisePoint) {
    // Create a marker for noise points:
    var noiseMarker = new H.map.Marker(noisePoint.getPosition(), {
      icon: noiseIcon,

      // Use min zoom from a noise point to show it correctly at certain zoom levels
      min: noisePoint.getMinZoom()
      });

    // Bind noise point data to the marker:
    noiseMarker.setData(noisePoint);
    return noiseMarker;
  }
  }
});
}