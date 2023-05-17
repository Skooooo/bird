
let name = null;
let roomNo = null;
let socket = io();
// let id = 0;


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init(id,nickname) {

    roomNo = id;

    console.log(roomNo);

    /* use id to connect to a chatroom */
    /* separate chatroom via different detail pages*/
    connectToRoom();

    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {

        // if (userId === name) {
        //     // it enters the chat
        //     hideLoginInterface(room, userId);
        // }
        // else {
        //     // notifies that someone has joined the room
        //     writeOnHistory('<b>'+userId+'</b>' + ' joined room ' + room, true);
        // }
    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        // let who = userId
        // if (userId === name) who = 'Me:';
        writeOnHistory('<b>' + chatText + '</b>', true);
    });

    // document.getElementById('who_you_are').innerHTML= userId;
    // document.getElementById('in_room').innerHTML= ' '+room;

}

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('messageDB', 1);

        request.onerror = (event) => {
            reject(new Error('Failed to open the database.'));
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('messages', { autoIncrement: true });
        };
    });
};

// const { MongoClient } = require('mongodb');
//
// // Connection URL
// const url = 'mongodb+srv://Team6:Team6@cluster0.7ydimha.mongodb.net/sightings?retryWrites=true&w=majority';
//
// // Create a new MongoClient
// const client = new MongoClient(url, { useUnifiedTopology: true });

// // Define the filter and update values
// const filter = { key: 'value' }; // Filter to identify the document(s) to update
// const update = { $set: { comments: 'updatedValue' } };

// Retrieve a specific key value
// async function retrieveValue() {
//     try {
//         // Connect to the MongoDB database
//         await client.connect();
//
//         // Specify the database and collection name
//         const database = client.db('sightings');
//         const collection = database.collection('sightings');
//
//         // Find the document and retrieve the specific key value
//         const document = await collection.findOne({}, { projection: { key: 1 } });
//
//         // Extract the value from the document
//         const value = document.key;
//
//         console.log('Retrieved value:', value);
//     } catch (error) {
//         console.error('Failed to retrieve value:', error);
//     } finally {
//         // Close the connection
//         await client.close();
//     }
// }

// const express = require('express');
// const app = express();
//
// app.get('/', (req, res) => {
//     const href = req.url;
//     res.send(`Current href: ${href}`);
//     console.log(href);
// });

function sendAjaxQuery(url, data) {
    $.ajax({
        url: url,  // URL to send request to
        data: JSON.stringify(data),  // Data to send in the request
        dataType: 'json',  // Expected data type of the response
        type: 'POST',  // HTTP method to use
        processData: false,  // Don't process the data
        contentType: false,  // Don't set the content type
        success: function (dataR) {  // Function to call on successful request
            // Show an alert that the sighting was added successfully
            alert('Sightings added successfully!');
            // Reset the form
            $('#xForm').trigger('reset');
            window.location.reload();
        },
        error: function (xhr, status, error) {  // Function to call on failed request
            // Show an alert with the error message
            alert('Error: ' + error.message);
        }
    });
}



function sendChatText() {
    const sightingId = 123;
    let chatText = document.getElementById('chat_input').value;
    // name = document.getElementById('name').value;
    if(navigator.onLine){
        socket.emit('chat', roomNo, "", chatText);
        // event.preventDefault();  // Prevent form submission
        // event.stopImmediatePropagation();  // Stop any other event handlers from being called
        // var myForm = document.getElementById('messageForm');  // Get the form element
        // var formData = new FormData(myForm);  // Create FormData from the form
        // console.log("form data: ", formData);
        console.log("message: ", chatText);
        const jsonData = {
            "id": roomNo,
            "message": chatText
        }
        sendAjaxQuery('/message', jsonData);
    } else{
        /* local storage */
        // const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages')) || {};
        // offlineMessages[sightingId] = offlineMessages[sightingId] || [];
        // offlineMessages[sightingId].push(chatText);
        // localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
        // writeOnHistory('<b>' + 'Me' + ':</b> ' + chatText + ' (pending online...)',false);

        /* indexDB */
        // Store a message in the database
        const storeMessage = async (message) => {
            const db = await openDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['messages'], 'readwrite');
                const objectStore = transaction.objectStore('messages');
                const request = objectStore.add(message);

                request.onerror = (event) => {
                    reject(new Error('Failed to store the message.'));
                };

                request.onsuccess = (event) => {
                    resolve();
                };
            });
        };

        storeMessage(chatText)
            .then(() => {
                console.log('Message stored successfully.');
            })
            .catch((error) => {
                console.error('Failed to store message:', error);
            });

        writeOnHistory(chatText + ' (pending online...)',false);

    }

}

function syncOfflineMessages() {
    const sightingId = 123;
    /* local storage */
    // const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages')) || {};
    // name = document.getElementById('name').value;
    // Object.entries(offlineMessages).forEach(([sightingId, messages]) => {
    //     messages.forEach((message) => {
    //         clearOnHistory();
    //         console.log("***********");
    //         socket.emit('chat', roomNo, name, message);
    //     });
    // });
    // localStorage.removeItem('offlineMessages');

    /* indexDB */
    // Retrieve all stored messages from the database
    const getMessages = async () => {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['messages'], 'readonly');
            const objectStore = transaction.objectStore('messages');
            const request = objectStore.getAll();

            request.onerror = (event) => {
                reject(new Error('Failed to retrieve messages.'));
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    };

    getMessages()
        .then((messages) => {
            messages.forEach((message) => {
                console.log('Message:', message);
                // Perform further processing or actions on each message
                clearOnHistory();
                console.log("***********");
                socket.emit('chat', roomNo, "", message);
            });
        })
        .catch((error) => {
            console.error('Failed to retrieve messages:', error);
        });

    // remove database when back online
    const deleteDB = async (databaseName) => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(databaseName);

            request.onerror = (event) => {
                reject(new Error('Failed to delete the database.'));
            };

            request.onsuccess = (event) => {
                resolve();
            };
        });
    };

    deleteDB('messageDB')
        .then(() => {
            console.log('Database deleted successfully.');
        })
        .catch((error) => {
            console.error('Failed to delete the database:', error);
        });
}

window.addEventListener('online', syncOfflineMessages);

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    // roomNo = document.getElementById('roomNo').value;
    // name = document.getElementById('name').value;
    // if (!name) name = 'Unknown-' + Math.random();
    name = "user";
    socket.emit('create or join', roomNo, name);
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnHistory(text, isOnline) {

    if(isOnline){
        let history = document.getElementById('history');
        let paragraph = document.createElement('p');
        paragraph.innerHTML = text;
        history.appendChild(paragraph);
        // console.log(history);
        document.getElementById('chat_input').value = ''; // clear input field
    }else{
        let history = document.getElementById('history');
        let paragraph = document.createElement('p');
        paragraph.setAttribute("id","offline");
        paragraph.innerHTML = text;
        history.appendChild(paragraph);
        // console.log(history);
        document.getElementById('chat_input').value = ''; // clear input field
    }
}

function clearOnHistory() {

    // let history = document.getElementById('history');

    let paragraph = document.getElementById('offline');

    // paragraph.innerHTML = text;
    console.log("paragraph");
    console.log(paragraph);
    // console.log("history");
    // console.log(history);

    paragraph.parentNode.removeChild(paragraph);

    // console.log(history);

    document.getElementById('chat_input').value = ''; // clear input field
}


/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
// function hideLoginInterface(room, userId) {
//     // document.getElementById('initial_form').style.display = 'none';
//     // document.getElementById('chat_interface').style.display = 'block';
//     document.getElementById('who_you_are').innerHTML= userId;
//     document.getElementById('in_room').innerHTML= ' '+room;
// }


