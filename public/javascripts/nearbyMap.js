const longitude = document.getElementById('longitude');
const latitude = document.getElementById('latitude');

navigator.geolocation.getCurrentPosition(
    (position) => {
        const current_lat = position.coords.latitude;
        const current_lng = position.coords.longitude;
        latitude.innerHTML = current_lat.toFixed(4);
        longitude.innerHTML = current_lng.toFixed(4);
    }
)

function getLocation() {
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
    // console.log(list)

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    console.log(list)

    const card = document.getElementById("card");
    var switching = true;
    var i, b, shouldSwitch = false;
    var m = 0;

    while (switching&&!shouldSwitch) {
        switching = false;
        b = card.getElementsByClassName("card mt-2");
        // console.log(b.length);
        for (i = 0;i < (b.length-1)&&!shouldSwitch;i++) {
            shouldSwitch = false;
            // console.log(b[i]);
            const b_id = document.getElementById("id" + i).innerHTML;
            if (list[i].distance > list[i+1].distance) {
                shouldSwitch = true;
                // console.log(list[i].distance + ":" + list[i+1].distance);

                break;
            }
            console.log(i);
        }
        console.log(i);
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[m], b[i])
            switching = true;
            shouldSwitch = false;
            // console.log(list[m].id+":"+m);
            // console.log(b[m]);
            // console.log(b[i])
            m++;
        }
        console.log("2."+b[i]);
        
        // console.log(list[m].id);
    }
}

