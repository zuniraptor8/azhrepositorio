function initMap() {
  const CONFIGURATION = {
    "ctaTitle": "Confirmar ubicacion",
    "mapOptions": {"center":{"lat":37.4221,"lng":-122.0841},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":false,"zoom":16,"zoomControl":true,"maxZoom":22,"mapId":"7e96eb91e6c45c79"},
    "mapsApiKey": "AIzaSyA_5zNfmy1ZKoBbL_GdN6Q03PpAi3eQcq8",
    "capabilities": {"addressAutocompleteControl":true,"mapDisplayControl":true,"ctaControl":false}
  };
  const componentForm = [
    'location',
    'locality',
    'administrative_area_level_1',
    'country',
    'postal_code',
  ];

  const getFormInputElement = (component) => document.getElementById(component + '-input');
  const map = new google.maps.Map(document.getElementById("7e96eb91e6c45c79"), {
    zoom: CONFIGURATION.mapOptions.zoom,
    mapId: '7e96eb91e6c45c79',
    center: { lat: 20.698013, lng: -103.377798 },
    mapTypeControl: false,
    fullscreenControl: CONFIGURATION.mapOptions.fullscreenControl,
    zoomControl: CONFIGURATION.mapOptions.zoomControl,
  });

  const image = {
    url: "https://svgshare.com/i/v0x.svg",
    size: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25, 50),
    scaledSize: new google.maps.Size(50, 50)
  };

  const autocompleteInput = getFormInputElement('location');
  const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, {
    fields: ["address_components", "geometry", "name"],
    types: ["address"],
  });

  const marker = new google.maps.Marker({ map: map, draggable: true, icon: image });

  autocomplete.addListener('place_changed', function () {
    marker.setVisible(true);
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      window.alert('No se encuentra el lugar indicado: \'' + place.name + '\'');
      return;
    }
    renderAddress(place);
    fillInAddress(place);
  });

  function fillInAddress(place) {
    const addressNameFormat = {
      'street_number': 'short_name',
      'route': 'long_name',
      'locality': 'long_name',
      'administrative_area_level_1': 'short_name',
      'country': 'long_name',
      'postal_code': 'short_name',
    };
    const getAddressComp = function (type) {
      for (const component of place.address_components) {
        if (component.types[0] === type) {
          return component[addressNameFormat[type]];
        }
      }
      return '';
    };
    getFormInputElement('location').value = getAddressComp('street_number') + ' ' + getAddressComp('route');
    for (const component of componentForm) {
      if (component !== 'location') {
        getFormInputElement(component).value = getAddressComp(component);
      }
    }
  }

  function renderAddress(place) {
    map.setCenter(place.geometry.location);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
  }

  const locationButton = document.createElement("button");

  locationButton.textContent = "Usar mi ubicación";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(pos);
          marker.setPosition(pos);
          marker.setVisible(true);

          const infoWindow = new google.maps.InfoWindow({
            content: "Location found.",
          });
          infoWindow.open(map, marker);

          fillInAddressFromGeolocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
          handleLocationError(true, map.getCenter());
        }
      );
    } else {
      handleLocationError(false, map.getCenter());
    }
  });

  function fillInAddressFromGeolocation(latitude, longitude) {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(latitude, longitude);

    geocoder.geocode({ 'latLng': latLng }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          const place = results[0];
          renderAddress(place);
          fillInAddress(place);
        }
      }
    });
  }
}

window.initMap = initMap;
