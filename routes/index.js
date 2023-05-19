var express = require("express");
var router = express.Router();
var multer = require("multer");

const path = require("path"); // get real file path for win/mac
const fs = require("fs"); // get file & convert to base64
const mime = require("mime"); // get file extension for validation

// const Sighting = require("../models/sightings"); // Require the Sighting model
const fetch = require("node-fetch");
const SPARQL_URL = "https://dbpedia.org/sparql";
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
// connect to our mangoDB via url link & username with password
const uri =
    "mongodb+srv://yjiao12:zhx02180218@cluster0.zhhlids.mongodb.net/bird_master";
const Schema = mongoose.Schema;
// Define a new schema for comments
const commentSchema = new Schema({
  // nickname: { type: String, required: true },  // Nickname of the commenter
  text: { type: String, required: true }, // Comment text
  // createdAt: { type: Date, default: Date.now }  // Time the comment was created
});
const sightingSchema = new Schema({
  dateTimeSeen: { type: Date, required: true }, // Date and time the sighting was seen
  location: {
    // Location of the sighting
    type: {
      // Type of the location data
      type: String,
      enum: ["Point"], // Only 'Point' is allowed
      required: true,
    },
    coordinates: {
      // Coordinates of the sighting
      type: [Number], // Array of numbers
      required: true,
    },
  },
  posterId: String, // ID of the poster
  description: { type: String, required: true }, // Description of the sighting
  identification: { type: String, default: "Unknown" }, // Identification of the sighting, defaults to 'Unknown'
  dbpediaURI: String, // URI for additional info
  img: { type: String }, // Path to image
  nickname: { type: String, required: true }, // Nickname of the poster
  comments: [commentSchema], // List of comments on the sighting
});

// connting to database
mongoose.connect(uri);
const db = mongoose.connection;
db.once("error", () => {
  console.warn("connection error");
});
db.once("open", () => {
  console.log("database is connected");
});
db.once("close", () => {
  console.log("db is disconnected");
});

const Sightings = mongoose.model("sighting_lists", sightingSchema);
let dbData = {};
/**
 * getting all entries from database
 */
const getItems = async () => {
  console.log("getting all entries from database");
  const sighting_list = await Sightings.find({});
  dbData = sighting_list;
  return dbData;
};

getItems();

/**
 * you can simulate the result of online saving process by altering the return value
 * eg: return false to indicate the online database is failed
 * eg: return true to indicate the online database is connected
 * @param {} params object saving to our database as a sighting
 * @return indicate if the function has saved the data success on the cloud.
 */
const createEntry = async (params) => {
  const sighting = new Sightings(params);
  /**
   * Tring to save the data to online mongodb
   *
   * if the saving action is success,
   * return true to render bird_list
   * if the saving action is failed,
   * return false to render db_failed to initialize the process of saving data to offline database
   */

  sighting
      .save()
      .then(() => {
        // 建议：不管是现在用 nodejs 还是之后用 react 或者 vue 用 JS 语言读未知参数
        // 对象之后加一个?，这个时候如果你读不到，就不会报错了
        console.log(params?.nickname, "has been successfully added to database");
        saveFlag = true;
        return true;
      })
      .catch((e) => {
        console.error("error happened");
        console.error(e);
        return false;
      });
  // return false;
};

// Configure multer storage options
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  // 图片名字
  filename: function (req, file, cb) {
    // Get the original image name, i.e. what the image was called when the user uploaded it
    var original = file.originalname;
    // Get the most original file name and cut the file name with "." Cut
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    // Saved file name going on present timestamp + '.' + original file name in '.' Cut the array to the first bit of file_extension.length - 1
    // eg: original = cute_bird.jpg -> file_extension = ['cute_bird', 'jpg']
    filename = Date.now() + "." + file_extension[file_extension.length - 1];
    cb(null, filename);
  },
});

// Set the instance object for the upload, which is used to call the storage object to save the image
var upload = multer({ storage: storage });

// Bird list route
router.get("/", async function (req, res) {
  console.log(dbData);

  try {
    // Fetch all sightings from the database
    // const sightings = await Sighting.find({});
    // Render the sightings_list view with the fetched data
    res.render("bird_list", { title: "", sightings: dbData });
  } catch (error) {
    // print error message in the console
    console.error(error);
    // rendering error page with promopt
    res.status(500).send("Error retrieving sightings from the database.");
  }
});

router.get("/nearby", async function (req, res) {
  try {
    // Fetch all sightings from the database, sorted by dateTimeSeen
    const sightings = await Sighting.find({});

    // Render the bird_recent view with the fetched data
    res.render("bird_nearby", { title: "", sightings });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving sightings from the database.");
  }
});

// Recent bird route

router.get("/recent", async function (req, res) {
  try {
    // Fetch all sightings from the database, sorted by dateTimeSeen
    const sightings = await Sighting.find({}).sort({ dateTimeSeen: -1 });

    // Render the bird_recent view with the fetched data
    res.render("bird_recent", { title: "", sightings });
  } catch (error) {
    // print error message in the console
    console.error(error);
    // rendering error page with promopt
    res.status(500).send("Error retrieving sightings from the database.");
  }
});

router.get("/add_bird", function (req, res) {
  res.render("add_bird", { title: "Enter a sighting information" });
});

// Add bird route
router.get("/add", function (req, res) {
  // adding from to the database
  res.render("bird_list", { title: "Bird_list", sightings: dbData });
});

/**
 *
 * @param {*} file img file
 * @returns img files in base 64 format
 */
const imgParse = (file) => {
  console.warn("🚀 ~ file: index.js:195 ~ imgParse ~ file:", file);
  const filePath = path.resolve(file); // Address of original document
  const fileMimeType = mime.getType(filePath); // Get the memeType of the file

  // Exit if it is not an image file
  if (!fileMimeType?.toString()?.includes("image") ?? true) {
    console.log(`Failed! ${filePath}:\tNot image file!`);
    return;
  }

  // Read file data
  let data = fs.readFileSync(filePath);
  data = Buffer.from(data).toString("base64");
  return data;
};

// Define a route for POST requests to '/add'
router.post("/add", async (req, res) => {
  // Log the request body to the console
  console.log("Request body:", req.body);

  // retrieving values from req.body
  const {
    identification,
    description,
    dateTimeSeen,
    nickname,
    location,
    myImg,
    img,
  } = req.body;
  console.warn("🚀 ~ file: index.js:224 ~ router.post ~ myImg:", myImg, img);
  // Create a new sighting object from the request body
  const newSighting = new Sightings({
    identification,
    description,
    // Store the image path, removing the 'public' part of the path
    // Here is the image saved in base64 format
    img: imgParse(myImg ?? img),
    dateTimeSeen,
    nickname,
    location: {
      type: "Point",
      // Get the coordinates from the request body
      coordinates: location.coordinates,
    },
    // Set the current date and time
    datetime: new Date(),
  });

  const savingData = {
    identification,
    description,
    // Store the image path, removing the 'public' part of the path
    // Here is the image saved in base64 format
    img: imgParse(myImg ?? img),
    dateTimeSeen,
    nickname,
    location: {
      type: "Point",
      // Get the coordinates from the request body
      coordinates: location.coordinates,
    },
    // Set the current date and time
    datetime: new Date(),
  };

  if (await createEntry(newSighting)) {
    console.log("Creating successfully");
    dbData.push(savingData);
    res.render("bird_list", { title: "Bird_list", sightings: dbData });
  } else {
    console.log("Failed to save");
    res.render("db_failed", {
      title: "Bad Request xxxxxxxx",
      ...savingData,
      myImg,
    });
  }

  //   // Save the new sighting to the database
  //   await newSighting.save();
  //   // Send a success message as the response

  //   res.json({ message: "Success" });
  // } catch (error) {
  //   // Log any errors to the console
  //   console.error(error);
  //   // Send an error message as the response, with a status code of 500
  //   res.status(500).send("Error saving sighting to the database.");
  // }
});

router.post("./directSave", async (req, res) => {
  const requestData = req.body;

  res.status(500).send("Error saving sighting to the database.");
  // const {
  //   nickname,
  //   datetime,
  //   location,
  //   description,
  //   identification,
  //   img,
  //   dateTimeSeen,
  // } = requestData;
  // const savingData = {
  //   nickname,
  //   datetime,
  //   location,
  //   description,
  //   identification,
  //   img: imgData,
  //   dateTimeSeen,
  // };
  // if (await createEntry(savingData)) {
  //   console.log("The offline data has been saved to the online database");
  // }
});

// Bird details/dbpedia
router.get("/sighting/:id", async function (req, res, next) {
  // try {
  // retrieving sightingId from request params
  const sightingId = req.params.id;
  console.warn("🚀 ~ file: index.js:321 ~ sightingId:", sightingId)
  // searching entry from the database by id
  const sighting = await Sightings.findById(sightingId);
  if (sighting) {
    // transform bird speci name to html encode name
    const birdName = encodeURIComponent(sighting?.identification || 'unspecific');
    console.warn("🚀 ~ file: index.js:327 ~ birdName:", birdName)
    // dbpedia query
    const query = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        SELECT ?label ?description ?uri WHERE {
            ?uri a dbo:Bird .
            ?uri dbo:abstract ?description ;
                rdfs:label ?label .
            ?uri foaf:isPrimaryTopicOf ?wikiPage .
            FILTER (LANG(?label) = 'en' && LANG(?description) = 'en' && STRSTARTS(LCASE(?label), "${birdName.toLowerCase()}"))
           }
           LIMIT 1
            `;
    // retrieving data ftom dbpedia url as json format
    const url = `${SPARQL_URL}?query=${encodeURIComponent(
        query
    )}&format=json`;
    console.warn("🚀 ~ file: index.js:346 ~ url:", url)
    // retrieving data from dbpedia
    const response = await fetch(url);
    // retrieving data from response
    const data = await response.json();
    // determine if it has the entry
    if (data.results.bindings.length > 0) {
      // retrieving from bindings index 0
      const birdInfo = data.results.bindings[0];
      console.warn("🚀 ~ file: index.js:353 ~ birdInfo:", birdInfo)
      // creating an object base on the information from dbpedia
      sighting.birdInfo = {
        name: birdInfo.label.value,
        description: birdInfo.description.value,
        uri: birdInfo.uri.value,
      };
    }
    // render page baseon the object just created
    res.render("bird_details", { title: "", sighting: sighting });
  } else {
    // if the entry does not exist in the database
    // render the page of 404 with prompt
    res.status(404).send("Sighting not found");
  }
  // }
  // catch (err) {
  //   // if error detected, render 500 page with prompt
  //   res.status(500).send(`Error: ${err.message}`);
  // }
});

//update identification
router.get("/sighting/:id/update", async function (req, res, next) {
  try {
    // retrieving sightingId from request params
    const sightingId = req.params.id;
    // searching entry from the database by id
    const sighting = await Sighting.findById(sightingId);
    // if the sighting entry exists
    if (sighting) {
      // render the page of update with the entry that just found
      res.render("update", { title: "Update a sighting", sighting: sighting });
    } else {
      // if the entry does not exist in the database
      // render the page of 404 with prompt
      res.status(404).send("Sighting not found");
    }
  } catch (err) {
    // if error detected, render 500 page with prompt
    res.status(500).send(`Error: ${err.message}`);
  }
});

//post identification
router.post("/sighting/:id/update", async function (req, res) {
  try {
    const sightingId = req.params.id;

    // Fetch the sighting from the database
    const sighting = await Sighting.findById(sightingId);

    if (sighting) {
      // Check if the ID matches the original poster's ID
      if (sighting.posterId === posterId) {
        // Update the sighting
        sighting.identification = newIdentification;
        await sighting.save();
        res.json(sighting);
      } else {
        // if the entry id does not match
        // render the page of 403 with prompt
        res.status(403).send("Unauthorized to update this sighting");
      }
    } else {
      // if the entry does not exist in the database
      // render the page of 404 with prompt
      res.status(404).send("Sighting not found");
    }
  } catch (err) {
    // if error detected, render 500 page with prompt
    res.status(500).send(`Error: ${err.message}`);
  }
});

// // Parse JSON bodies
// router.use(bodyParser.json());

// post messages
router.post("/message", async function (req, res) {
  console.log("Request body:", req.body);

  const convertedObjectId = new ObjectId(req.body.id);
  console.log("objectId: ", convertedObjectId);
  const comment = { text: req.body.message };
  Sighting.updateOne(
      { _id: convertedObjectId },
      { $push: { comments: comment } }
  )
      .then(() => {
        console.log("Array updated successfully");
      })
      .catch((error) => {
        console.error("Error updating array:", error);
      });
});

//get knowledge graph
router.get("/sighting/:id", function (req, res, next) {
  // Fetch the sighting from your database...
  // Then fetch the bird information from DBpedia:
  const resource = `http://dbpedia.org/resource/${sighting.identification}`;
  const endpointUrl = "https://dbpedia.org/sparql";
  const sparqlQuery = `
        SELECT ?label ?scientificName ?abstract ?uri WHERE {
            <${resource}> rdfs:label ?label .
            <${resource}> dbo:abstract ?abstract .
            <${resource}> dbo:scientificName ?scientificName .
            BIND(IRI(?abstract) AS ?uri)
            FILTER (langMatches(lang(?label),"EN"))
            FILTER (langMatches(lang(?abstract),"EN"))
        }`;
  const urlEncodedQuery = encodeURIComponent(sparqlQuery);
  const url = `${endpointUrl}?query=${urlEncodedQuery}&format=json`;

  // retrieving data from dbpedia
  // if the data returned, render the page sighting
  fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Extract the bird information from the data...
        const bird = data.results.bindings[0];
        res.render("sighting", {
          title: "Sighting",
          sighting: sighting,
          bird: bird,
        });
      });
});

module.exports = router;