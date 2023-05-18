const longitude = document.getElementById('longitude');
const latitude = document.getElementById('latitude');
const card = document.getElementById("card");
const errorText = document.getElementById("errorText");


navigator.geolocation.getCurrentPosition(
    ((position) => {
        const current_lat = position.coords.latitude;
        const current_lng = position.coords.longitude;
        latitude.innerHTML = current_lat.toFixed(4);
        longitude.innerHTML = current_lng.toFixed(4);
        getLocation()
    }),
    ((error) => {
        card.style.display = "none";
        errorText.style.display = "flex";
        console.log(errorText)
    })
)


function getLocation() {
    card.style.display = "flex";
    errorText.style.display = "none";
    const R = 6371;
    let list = [];

    const length = document.getElementById("length").innerHTML;
    for (let i = 0; i < length; i++) {
        const cords = document.getElementById("dis" + i);
        const id = document.getElementById("id" + i).innerHTML;
        const long = document.getElementById('lng' + i).innerHTML;
        const lati = document.getElementById('lat' + i).innerHTML;
        const a_lat = parseFloat(lati).toFixed(4);
        const a_lng = parseFloat(long).toFixed(4);
        const dLat = deg2rad(parseFloat(latitude.innerHTML) - a_lat);
        const dLng = deg2rad(parseFloat(longitude.innerHTML) - a_lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(a_lat)) * Math.cos(deg2rad(parseFloat(latitude.innerHTML))) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = (R * c).toFixed(4); // Distance in km
        cords.innerHTML = distance;
        list.push({ distance: distance, id: id });
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    list.sort((a, b) => (a.distance - b.distance));

    var switching = true;
    var i = 0, shouldSwitch;
    var m = 0;

    while (switching && m < list.length) {
        switching = false;
        const b = card.getElementsByClassName("card mt-2");
        shouldSwitch = false;
        for (i = 0; i < b.length && !shouldSwitch; i++) {
            var b_id = b[i].id;
            if (list[m].id == b_id) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i], b[m])
            switching = true;
            m++;
        }
    }
}

