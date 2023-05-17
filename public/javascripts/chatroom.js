
let name = null;
let roomNo = null;
let socket = io();
// let id = 0;

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {



    connectToRoom();



    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {

        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        }
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

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

// function random(lower, upper) {
//     return Math.floor(Math.random() * (upper - lower)) + lower;
// }

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */


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

function sendChatText() {
    const sightingId = 123;
    let chatText = document.getElementById('chat_input').value;
    // name = document.getElementById('name').value;
    if(navigator.onLine){
        socket.emit('chat', roomNo, "", chatText);
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
    roomNo = "D1";
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
function hideLoginInterface(room, userId) {
    // document.getElementById('initial_form').style.display = 'none';
    // document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}


