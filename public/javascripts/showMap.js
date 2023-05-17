
async function initMap() {
    const lat = document.getElementById('lat').innerHTML;
    const lng = document.getElementById('lng').innerHTML;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: { lat: latitude, lng: longitude },
    });

    const marker = new google.maps.Marker({
        map,
        position: { lat: latitude, lng: longitude },
    });

    const latLng = {
        lat: latitude,
        lng: longitude
    };

    const addressName = document.getElementById("address");
    // Create a Geocoder object
    const geocoder = new google.maps.Geocoder();
    // Use the Geocoder to get the address
    geocoder.geocode({ 'location': latLng }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                // Retrieve the formatted address
                const address = results[0].formatted_address;

                // Do something with the address (e.g., display it)
                addressName.innerHTML = address;
            } else {
                addressName.innerHTML = 'No results found';
            }
        } else {
            addressName.innerHTML = 'Geocoder failed due to: ' + status;
        }
    });

}

