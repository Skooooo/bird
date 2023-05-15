
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
}

