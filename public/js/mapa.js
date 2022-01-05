function  init(data) {
    const map = L.map('map', {
      // drawControl: true, // draw tools, more down
      center: [41.6863, 1.6382],
      zoom: 8,
      attribution: 'Institut Cartogràfic i Geològic de Catalunya CC-BY-SA-3'
    });
    const topoMonICGC = L.tileLayer('https://geoserveis.icgc.cat/styles/icgc/{z}/{x}/{y}.png', {
      maxZoom: 19,
     // attribution: 'Institut Cartogràfic i Geològic de Catalunya CC-BY-SA-3'
    }).addTo(map);
    const geologicICGC = L.tileLayer('https://tilemaps.icgc.cat/mapfactory/wmts/geologia/MON3857NW/{z}/{x}/{y}.png', {
      maxZoom: 14,
     // attribution: 'Institut Cartogràfic i Geològic de Catalunya CC-BY-SA-3'
    });
    
    const ortoICGC =
      L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/orto/GRID3857/{z}/{x}/{y}.png', {
        maxZoom: 19,
       // attribution: //'Institut Cartogràfic i Geològic de Catalunya CC-BY-SA-3'
      });
      const mapaBase = {
        'Topogràfic': topoMonICGC,
        'Ortofoto': ortoICGC,
        'Geològic': geologicICGC,
      };
      controlCapes = L.control.layers(mapaBase, null, {collapsed: false});
     controlCapes.addTo(map)
    
  // get geojson from mongodb//
  // Fetch stores from API
  async function getPoints() {   
     // fetch position from api 
     const res = await  fetch(`/geojson/user`);
     const data = await res.json(); // convert to json
      
     console.log(data)

     // map create new arrays from other arrays
     const positionsGj = data.map(position => {
      // console.log("HOLA X 5")
       //console.log(position.title)
      return {
          type: 'Feature',
          geometry: {
              type: 'Point',
              coordinates: [position.location.coordinates[0], position.location.coordinates[1]]
              },
          properties: {
            title: position.title,
            body: position.body,
            datePosted: position.datePosted,
            user: position.userid.username,
            image: position.image
          }
      }
  });
  loadMap(positionsGj);
};
 
// Load map with stores
function loadMap(positionsGj) {
 // console.log("adeu")
    L.geoJSON({
                   type: 'FeatureCollection',
                   features: positionsGj
                    //features: [
                    //    {
                  //           type: 'Feature',
                  //           geometry: {
                  //               type: 'Point',
                  //               coordinates: [1.111318, 41.337839]
                  //           },
                  //           properties: {
                  //               storeId: '0001',
                  //      //         icon: 'shop'
                  //           }
                  //       }
                  // ]
        }, {
          onEachFeature: function (feature, layer) {
            let dataPost = feature.properties.datePosted
           // console.log(dataPost)
            let dateSliced = dataPost.split("T") // Split date by T
           // console.log(dateaSliced)
           // console.log(typeof feature.properties.datePosted)
            dateSlicedByCat = dateSliced[0].split("-")
            //console.log(dateSlicedByCat)
            
            console.log(feature.properties.image == null)

            if (feature.properties.image) {

              layer.bindPopup('<h4 class="popup">'+feature.properties.title+`</h4>
              <hr class="popup">
              <p class="popup"><span class="popup-description">Description: </span>`+feature.properties.body+`</p>` +
              `<img src="`+ feature.properties.image+`" style="height:150px;">`+            
              `<p class="popup"><span class="popup-description">Per: </span>`+feature.properties.user+
              `<p class="popup"><span class="popup-description">Creat al: </span>`+
              dateSlicedByCat[2]+ '-' + dateSlicedByCat[1] + '-' + dateSlicedByCat[0] + `</p>
              <p id="popupcoord">Lat: `+feature.geometry.coordinates[1]+', Long:'+
              feature.geometry.coordinates[0]+'</p>'
            );
            // data outside map
            //document.getElementById("stats").innerHTML = feature.properties.name
            } else {
              layer.bindPopup('<h4 class="popup">'+feature.properties.title+`</h4>
              <hr class="popup">
              <p class="popup"><span class="popup-description">Description: </span>`+feature.properties.body+`</p>` +
              // no img
              //`<img src="`+ feature.properties.image+`" style="height:150px;">`+
              `<p class="popup"><span class="popup-description">Per: </span>`+feature.properties.user+
              `<p class="popup"><span class="popup-description">Creat al: </span>`+
              dateSlicedByCat[2]+ '-' + dateSlicedByCat[1] + '-' + dateSlicedByCat[0] + `</p>
              <p id="popupcoord">Lat: `+feature.geometry.coordinates[1]+', Long:'+
              feature.geometry.coordinates[0]+'</p>'
              );
            }

            
        }
        }).addTo(map);
    }
    getPoints();

    ///////////////////////////
    // EXEMPLE add geojson, add marker
    //var marker = L.marker([42.140, 1.706]).addTo(map); // coordenades al reves k geojson
    // L.geoJSON().addTo(map);
    //   var myLayer = L.geoJSON({
    //     "type": "Feature",
    //     "properties": {
    //         "name": "Coors Field",
    //         "amenity": "Baseball Stadium"
    //     },
    //     "geometry": {
    //         "type": "Point",
    //         "coordinates": [ 1.706, 42.240] //coordenades al reves k al marker
    //     }
    //   }).addTo(map);
      //myLayer.addData(geojsonFeature);
    ///////////////////////////
     // show your current location
    L.control.locate().addTo(map);
    // add map scale
    L.control.scale({position: 'bottomleft'}).addTo(map)
    //FULL SCREEN 
    L.control.fullscreen().addTo(map);
    // map coordinates mouse
    map.on('mousemove', function(e) {
    //console.log(e)
    const latitude = e.latlng.lat.toFixed(5);
    const longitude = e.latlng.lng.toFixed(5);
    $('.coordinate').html(`Lat: ${latitude}     Long: ${longitude}`)
    });

     // DRAWN NEW MARKERS//
  // initiate a variable to store the drawn items:
  // FeatureGroup is to store editable layers
  let drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  //create drawing controls and toolbar
  const drawControl = new L.Control.Draw({
    draw: {
      circle: false,
      marker: true,
      polyline: false, 
      polygon: false,
      rectangle: false
    }
  }).addTo(map);


  //  capture the data that is drawn using  event on Leaflet called ‘draw:created’
  map.on('draw:created', (e) => {
      // Each time we create a feature(point, line or polygon), we add this feature to the feature group wich is drawnItems in this case
      drawnItems.addLayer(e.layer);

      drwanItemsGJ = drawnItems.toGeoJSON();
      //console.log(drwanItemsGJ.features) // 
      //console.log(drwanItemsGJ.features[0].geometry); // get geometry first marker
      //console.log(drwanItemsGJ.features[0].geometry.coordinates[0]);  //get coordinate x
      const coords = e.layer._latlng;
      console.log(coords) // get coordinates of the last marker
    
    // popup entry data, form
    const tempMarker = drawnItems.addLayer(e.layer);
  
    const popupContent = 
    '<form action="/positions/store" method="POST" id="myForm" class="form"  enctype="multipart/form-data">'+
      
        '<label class="control-label col-sm-5 form-label"><b>Title: </b></label>'+
        '<textarea class="form-control form-text" rows="1" id="title" name="title"></textarea>'+
        
        '<label style="margin-top: 20px" class="control-label col-sm-5 form-label"><b>Description: </b></label>'+   
        '<textarea class="form-control" rows="3" id="body" name="body"></textarea>'+ 
        
        '<input style="display: none;" type="text" id="lat" name="lat" value="'+coords.lat.toFixed(6)+'" />'+
        '<input style="display: none;" type="text" id="lng" name="lng" value="'+coords.lng.toFixed(6)+'" />'+
    
        
        '<label style="margin-top: 20px" class="control-label col-sm-5 form-label"><b>Image: </b></label>'+
        '<input type="file" class="form-control" id="image" name="image"></input>' +

        '<div style="text-align:center;" class="col-xs-4 col-xs-offset-2"><a href="/" type="button" class="btn">Cancel<a/></div>'+
        '<div style="text-align:center;" class="col-xs-4">'+
            '<button  form="myForm" type="submit" value="submit" class="btn btn-primary trigger-submit">Submit</button>'+
        '</div>'
    
    +'</form>';

    tempMarker.bindPopup(popupContent,{
          keepInView: true,
          closeButton: false
          }).openPopup();
   
})}

