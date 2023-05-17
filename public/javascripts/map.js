
// Initialize and add the map
async function initAutocomplete() {
    let map, infoWindow, marker;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: -34.397, lng: 150.644 },
    }); // show map at (-34.397, 150.644)

    const longitude = document.getElementById('longitude'); // get longitude element
    const latitude = document.getElementById('latitude'); // get latitude element

    infoWindow = new google.maps.InfoWindow(); // create a info window
    const infowindowContent = document.getElementById("infowindow-content"); // get info window element
    const locationBtn = document.createElement("button"); // create a button of get your current location

    // button css format
    locationBtn.style.padding = "10px";
    locationBtn.style.backgroundColor = "white";
    locationBtn.textContent = "Current Location";

    locationBtn.classList.add("custom-map-control-button"); // add button to google map
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(locationBtn); // add button on google map and showing on the left top
    locationBtn.addEventListener("click", () => { // button click event listener
        if (navigator.geolocation) { //ensure you allow navigator to get your location
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }; // get your current location as a coords with lat and lng
                    infoWindow.setPosition(pos); // info window will show at a coords of your current location on google map
                    infowindowContent.children.namedItem("place-name").textContent = "";
                    infowindowContent.children.namedItem("place-id").textContent = "latitude: " + pos.lat + " longitude: " + pos.lng;
                    infowindowContent.children.namedItem("place-address").textContent = "";
                    infoWindow.setContent(infowindowContent); // set a content of info window
                    infoWindow.open(map); // display it on map
                    map.setCenter(pos); // set the map center on your current location 
                    latitude.value = pos.lat.toFixed(4); // the value of latitude element will show as lat with 4 decimal places
                    longitude.value = pos.lng.toFixed(4); // the value of longitude element will show as lng with 4 decimal places
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter()); // show error at center of map with info window
                }
            );
        } else {
            handleLocationError(false, infoWindow, map.getCenter()); // show error at center of map with info window
        }
    });


    // get error
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }

    const search = document.getElementById("search"); // get search element
    const searchbox = new google.maps.places.SearchBox(search); // create a search box on google map

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(search); // add a search box on the top left of map

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchbox.setBounds(map.getBounds());
    });

    let markers = [];
    infoWindow.setContent(infowindowContent);
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchbox.addListener("places_changed", () => {

        infoWindow.close();
        const places = searchbox.getPlaces();
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place.
            markers.push(
                marker = new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });
            marker.setVisible(true);

            // set content of info window
            infowindowContent.children.namedItem("place-name").textContent = place.name;
            infowindowContent.children.namedItem("place-id").textContent =
                place.place_id;
            infowindowContent.children.namedItem("place-address").textContent =
                place.formatted_address;
            infoWindow.open(map, marker);

            console.log(infowindowContent)
            var location = place.geometry.location;
            var lat = location.lat();
            var lng = location.lng();
            latitude.value = lat.toFixed(4);
            longitude.value = lng.toFixed(4);
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

        });
        map.fitBounds(bounds);
    });


}

window.initAutocomplete = initAutocomplete;
