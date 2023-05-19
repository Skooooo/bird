
let name = null;
let roomNo = null;
let socket = io();

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

    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        // let who = userId
        // if (userId === name) who = 'Me:';
        writeOnHistory('<b>' + chatText + '</b>', true);
    });
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
            window.location.reload();
        },
        error: function (xhr, status, error) {  // Function to call on failed request
            // Show an alert with the error message
            alert('Error: ' + error.message);
        }
    });
}

function sendDataToServer(data) {
    const url = '/message'; // Replace with the actual URL of your server route

    // Convert data to JSON string
    const jsonData = JSON.stringify(data);

    // Set up fetch request options
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    };

    // Send the fetch request
    fetch(url, options)
        .then(response => {
            if (response.ok) {
                // Handle success
                return response.json();
            } else {
                // Handle error
                throw new Error('Request failed');
            }
        })
        .then(data => {
            // Process the response data
            console.log(data);
        })
        .catch(error => {
            // Handle error
            console.error(error);
        });
}

function sendChatText() {
    const sightingId = 123;
    let chatText = document.getElementById('chat_input').value;
    // name = document.getElementById('name').value;
    if(navigator.onLine){
        socket.emit('chat', roomNo, "", chatText);

        console.log("message: ", chatText);
        const jsonData = {
            "id": roomNo,
            "message": chatText
        }
        sendDataToServer(jsonData);
    } else{

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

    let paragraph = document.getElementById('offline');

    console.log("paragraph");
    console.log(paragraph);

    paragraph.parentNode.removeChild(paragraph);

    // console.log(history);

    document.getElementById('chat_input').value = ''; // clear input field
}



