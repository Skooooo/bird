// // Function to send an AJAX request
// function sendAjaxQuery(url, data) {
//     $.ajax({
//         url: url,  // URL to send request to
//         data: data,  // Data to send in the request
//         dataType: 'json',  // Expected data type of the response
//         type: 'POST',  // HTTP method to use
//         processData: false,  // Don't process the data
//         contentType: false,  // Don't set the content type
//         success: function (dataR) {  // Function to call on successful request
//             // Show an alert that the sighting was added successfully
//             alert('Sightings added successfully!');
//             // Reset the form
//             $('#xForm').trigger('reset');
//             window.location.reload();
//         },
//         error: function (xhr, status, error) {  // Function to call on failed request
//             // Show an alert with the error message
//             alert('Error: ' + error.message);
//         }
//     });
// }

// // Function to handle form submission
// function onSubmit() {
//     event.preventDefault();  // Prevent form submission
//     event.stopImmediatePropagation();  // Stop any other event handlers from being called
//     var myForm = document.getElementById('xForm');  // Get the form element
//     var formData = new FormData(myForm);  // Create FormData from the form

//     // Update the location coordinates in the FormData
//     formData.set("location[coordinates][0]", parseFloat(document.getElementById("longitude").value));
//     formData.set("location[coordinates][1]", parseFloat(document.getElementById("latitude").value));

//     // Create a sighting object from the form data
//     let sighting = {
//         // Extract each field from the form data
//         nickname: formData.get('nickname'),
//         dateTimeSeen: formData.get('dateTimeSeen'),
//         location: {
//             type: formData.get('location[type]'),
//             coordinates: [
//                 formData.get('location[coordinates][0]'),
//                 formData.get('location[coordinates][1]')
//             ]
//         },
//         description: formData.get('description'),
//         identification: formData.get('identification'),
//         myImg: formData.get('myImg')  // Handle image separately since it's a file
//     };

//     // Interact with IndexedDB to store the sighting
//     const sightingsIDB = requestIDB.result;
//     const transaction = sightingsIDB.transaction(["Sightings"], "readwrite");  // Open a read-write transaction
//     const sightingsStore = transaction.objectStore("Sightings");  // Get the Sightings object store
//     const addRequest = sightingsStore.add(sighting);  // Add the sighting to the store
//     // Add event listener for successful addition
//     addRequest.addEventListener("success", () => {
//         addSighting("Added " + "#" + addRequest.result + ": " + sighting.nickname);
//         const getRequest = sightingsStore.get(addRequest.result);  // Get the newly added sighting
//         // Add event listener for successful retrieval
//         getRequest.addEventListener("success", () => {
//             addSighting("Found " + JSON.stringify(getRequest.result));
//             insertSightingInList(getRequest.result);  // Insert the sighting into the list
//         });
//     });

//     console.log(formData);  // Log the form data
//     sendAjaxQuery('/add', formData);  // Send the form data to the server
//     return false;  // Prevent the form from being submitted normally
// }
