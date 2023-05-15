
// Initialize and add the map
async function initAutocomplete() {
    let map, infoWindow, marker;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: -34.397, lng: 150.644 },
    });

    const longitude = document.getElementById('longitude');
    const latitude = document.getElementById('latitude');

    infoWindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    const locationBtn = document.createElement("button");
    locationBtn.style.padding = "10px";
    locationBtn.style.backgroundColor = "white";
    locationBtn.textContent = "Current Location";
    locationBtn.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(locationBtn);
    locationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent("latitude: " + pos.lat + " longitude: " + pos.lng);
                    infoWindow.open(map);
                    map.setCenter(pos);
                    latitude.value = pos.lat.toFixed(4);
                    longitude.value = pos.lng.toFixed(4);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }

    const search = document.getElementById("search");
    const searchbox = new google.maps.places.SearchBox(search);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(search);
    map.addListener("bounds_changed", () => {
        searchbox.setBounds(map.getBounds());
    });
    infoWindow.setContent(infowindowContent);
    let markers = [];
    searchbox.addListener("places_changed", () => {
        infoWindow.close();
        const places = searchbox.getPlaces();
        if (places.length == 0) {
            return;
        }

        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

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
            infowindowContent.children.namedItem("place-name").textContent = place.name;
            infowindowContent.children.namedItem("place-id").textContent =
                place.place_id;
            infowindowContent.children.namedItem("place-address").textContent =
                place.formatted_address;
            infoWindow.open(map, marker);

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
