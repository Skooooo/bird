function sendAjaxQuery(url, data) {
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        processData: false,
        contentType: false,
        success: function (dataR) {

            // Add an alert to inform the user that the character was added successfully
            alert('Sightings added successfully!');

            // Clear the form
            $('#xForm').trigger('reset');
        },
        error: function (xhr, status, error) {

            alert('Error: ' + error.message);
        }
    });
}

function onSubmit() {
    event.preventDefault();
    event.stopImmediatePropagation();
    var myForm = document.getElementById('xForm');
    var formData = new FormData(myForm);

    formData.set("location[coordinates][0]", parseFloat(document.getElementById("longitude").value));
    formData.set("location[coordinates][1]", parseFloat(document.getElementById("latitude").value));



    let sighting = {
        nickname: formData.get('nickname'),
        dateTimeSeen: formData.get('dateTimeSeen'),
        location: {
            type: formData.get('location[type]'),
            coordinates: [
                formData.get('location[coordinates][0]'),
                formData.get('location[coordinates][1]')
            ]
        },
        description: formData.get('description'),
        identification: formData.get('identification'),
        myImg: formData.get('myImg') // handle image in a special way since it's a file
    };

    const sightingsIDB = requestIDB.result;
    const transaction = sightingsIDB.transaction(["Sightings"], "readwrite");
    const sightingsStore = transaction.objectStore("Sightings");
    const addRequest = sightingsStore.add(sighting);
    addRequest.addEventListener("success", ()=>{
        addSighting("Added " + "#" + addRequest.result + ": " + sighting.nickname);
        const getRequest = sightingsStore.get(addRequest.result);
        getRequest.addEventListener("success", ()=>{
            addSighting("Found " + JSON.stringify(getRequest.result));
            insertSightingInList(getRequest.result);
        });
    });

    console.log(formData);
    sendAjaxQuery('/add', formData);
    return false;
}

