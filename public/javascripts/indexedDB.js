/**
 * Function to add a sighting message, optionally clearing old messages
 * @param {*} sighting the entry that need to add
 * @param {*} clear If not clearing, prepend old messages
 */
const addSighting = (sighting, clear = false) => {
    let message = document.getElementById("message"); // Get the message element
    let old_txt = "";
    if (!clear) {
        old_txt = message.innerHTML + "\n"; // If not clearing, prepend old messages
    }
    message.innerHTML = old_txt + sighting; // Set the message to the old messages plus the new sighting
};

/**
 * Function to handle IndexedDB upgrades
 * @param {*} ev enevt
 */
const handleUpgrade = (ev) => {
    const db = ev.target.result; // Get the database from the event
    db.createObjectStore("Sightings", { keyPath: "id", autoIncrement: true }); // Create a new object store
    addSighting("Upgraded object store..."); // Add a message about the upgrade
};

/**
 * Function to insert a sighting into a list (to be implemented)
 * @param {*} sighting the entry that need to insert
 */
const insertSightingInList = (sighting) => {
    // Tfunction that updates UI with the new sighting
};

/**
 * Function to update the list of sightings
 */
const updateSightingList = () => {
    const sightingsIDB = requestIDB.result; // Get the IndexedDB database
    const transaction = sightingsIDB.transaction(["Sightings"]); // Start a transaction
    const sightingsStore = transaction.objectStore("Sightings"); // Get the Sightings object store
    const getAllRequest = sightingsStore.getAll(); // Request to get all sightings
    // Add an event listener for when the request succeeds
    getAllRequest.addEventListener("success", () => {
        const sightings = getAllRequest.result; // Get the results of the request
        // Loop over the results and insert each one into the list
        for (const sighting of sightings) {
            insertSightingInList(sighting);
        }
    });
};

// Open a connection to the IndexedDB database
const requestIDB = indexedDB.open("BirdAppDB");
// Add an event listener for when the database needs to be upgraded
requestIDB.addEventListener("upgradeneeded", handleUpgrade);

// Add an event listener for when there's an error opening the database
requestIDB.addEventListener("error", (err) => {
    addSighting("ERROR : " + JSON.stringify(err)); // Add a message about the error
});
