const addSighting = (sighting, clear=false) => {
    let message = document.getElementById("message");
    let old_txt = "";
    if (!clear) {
        old_txt = message.innerHTML + "\n";
    }
    message.innerHTML = old_txt + sighting;
};



const handleUpgrade = (ev) => {
    const db = ev.target.result;
    db.createObjectStore("Sightings", { keyPath: "id", autoIncrement: true });
    addSighting("Upgraded object store...");
};




const insertSightingInList = (sighting) => {
    // Tfunction that updates UI with the new sighting
};

const updateSightingList = () => {
    const sightingsIDB = requestIDB.result;
    const transaction = sightingsIDB.transaction(["Sightings"]);
    const sightingsStore = transaction.objectStore("Sightings");
    const getAllRequest = sightingsStore.getAll();
    getAllRequest.addEventListener("success", ()=>{
        const sightings = getAllRequest.result;
        for (const sighting of sightings) {
            insertSightingInList(sighting);
        }
    });
};

const requestIDB = indexedDB.open("BirdAppDB");
requestIDB.addEventListener("upgradeneeded", handleUpgrade);

requestIDB.addEventListener("error", (err) => {
    addSighting("ERROR : " + JSON.stringify(err));
});
