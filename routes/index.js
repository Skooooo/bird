var express = require("express");
var router = express.Router();

const path = require("path"); // get real file path for win/mac
const fs = require("fs"); // get file & convert to base64
const mime = require("mime"); // get file extension for validation

const mongoose = require("mongoose"); // connecting to mangoDB

// connect to our mangoDB via url link & username with password
const uri =
  "mongodb+srv://yjiao12:zhx02180218@cluster0.zhhlids.mongodb.net/bird_master";
const Schema = mongoose.Schema;

// init database schema
const sightingSchema = new Schema({
  nickname: { type: "string", default: "nickname" },
  dateTime: { type: "string", default: "dateTime" },
  location: { type: "string", default: "location" },
  description: { type: "string", default: "description" },
  identification: { type: "string", default: "identification" },
  img: { type: "string", default: "base64Img" },
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

// The schema declared here is used to query the database for the sighting_lists library, and then mongoose is called to create a new database model (Sightings) that can be called later in the code
const Sightings = mongoose.model("sighting_lists", sightingSchema);
let dbData = {};

// The two methods here, getItems, createEntry, are both called to render to ejs

/**
 * getting all entries from database
 */
const getItems = async () => {
  console.log("getting all entries from database");
  const sighting_list = await Sightings.find({});
  dbData = sighting_list;
  return dbData;
};

let saveFlag = false;

/**
 * @param {} params object saving to our database as a sighting
 * @return indicate if the function save the data success.
 */
const createEntry = async (params) => {
  // const sighting = new Sightings(params);
  // sighting
  //   .save()
  //   .then(() => {
  //
  //
  //     console.log(params?.nickname, "has been successfully added to database");
  // saveFlag = true
  //     return true;
  //   })
  //   .catch((e) => {
  //     console.error(e);
  //     return false;
  //   });
  return false;
};

/**
 *
 * @param {} file get original image file
 * @returns image file in base 64 format
 */
const imgParser = (file) => {
  const filePath = path.resolve(file); // get file exact path no matter which OS
  const fileMimeType = mime.getType(filePath); // get file type. eg: image

  // if the file not the image file consle the prompt
  // if cannot get file type, we believe the error must be happened, so stop running the parser
  if (!fileMimeType?.toString()?.includes("image") ?? true) {
    console.error(`Failed! ${filePath}:\tNot image file!`);
    return;
  }

  let data = fs.readFileSync(filePath);
  data = Buffer.from(data).toString("base64");
  return data;
};

/* GET home page. */
router.get("/", function (req, res) {
  // res.render("bird_list", { title: "Bird List", data: getItems() });
  res.render("welcome", {
    title: "Welcome",
    save: saveFlag ? "succes" : "failed",
  });
});

router.post("/", (req, res) => {
  // req is the form returned by the page
  const requestData = req.body;
  const { nickname, datetime, location, description, identification, img } =
    requestData;
  const imgData = imgParser(img); // imgData is 64 base
  const savingData = {
    nickname,
    datetime,
    location,
    description,
    identification,
    img: imgData,
  };
  if (createEntry(savingData)) {
    // TODO
    // Since I don't know what this success page looks like, I didn't write it, so I'll use this instead
    res.render("db_failed", { title: "success", savingData: savingData });
  } else {
    res.render("db_failed", { title: "Bad Request xxxxxxxx", ...savingData });
  }
});

router.post("./directSave", (req, res) => {
  const requestData = req.body;
  const { nickname, datetime, location, description, identification, img } =
    requestData;
  const savingData = {
    nickname,
    datetime,
    location,
    description,
    identification,
    img: imgData,
  };
  if (createEntry(savingData)) {
    console.log("success");
  } else {
    // TODO
    // Not sure there is a need for anything here
    console.log("Another attempt to save offline data failed");
  }
});

router.get("/list", function (req, res) {
  res.render("bird_list", { title: "List" });
});

router.get("/recent", function (req, res) {
  res.render("bird_recent", { title: "Recent" });
});

router.get("/detail", function (req, res) {
  res.render("bird_details", { title: "Details" });
});

router.use(express.static("public"));

module.exports = router;
