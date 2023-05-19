# Project Name: Sightings and Chat Application
## Introduction
This project involves creating a web application that allows users to create, view and sort sightings, with associated details such as description, date/time, user nickname, location and an associated image. It also includes a chat functionality that enables users to add chat messages to the sightings they've created, either while online or offline.

## Functionalities
### Sightings
Creating New Sightings: Users can create new sightings with associated details like description, date/time, nickname, location and an associated image. The location can be fetched from geolocation or optionally selected from a map. Images can be uploaded from the file system or referenced using a URL and must be transformed to base64 before being stored in MongoDB.

Viewing All Sightings: Users can view all sightings along with their details.

Sorting Sightings: Sightings can be sorted by the most recent ones. As a stretch goal, sightings can also be sorted by distance away.

Sighting Selection: A sighting can be selected for more detail/chat by clicking on it.

### Online/Offline Modes
1.Online Mode: When online, the details of the sightings must be sent to the MongoDB database.

2.Offline Mode: When the user is offline, changes should be stored locally for uploading later. It should be possible to create at least one new sighting in the browser using IndexedDB. You can add chat messages to sightings that the user has newly and previously created.
### Synchronization
1.When the device comes online, local changes must be uploaded to the server.

2.Retrieve updates to the list of sightings since the last sync.

3.Reload any chat messages related to the user's created sightings.

4.As a stretch goal, notify the user of new messages in their chats for sightings they created.
### Chat Messages
1.The chat part of the application must be progressive, support online and offline interaction, and be implemented using socket.io in a Node.js framework.

2.Any new message must be visualized in real-time.

3.The user must be able to add new messages which will appear in real-time on other users' chats.

4.When offline, messages can be added to sightings that the user created, and the chat will sync up when online with new messages being shown to everyone viewing the sighting detail.

5.Messages are linked to a specific sighting and you might choose to store the chat within the sighting document/object in MongoDB.
### Server
The server must be implemented using Node.js+Express, support the chat system and connect to MongoDB.

### Data Storage and Retrieval
Data storage must be implemented using MongoDB as the network DB and IndexedDB as browser storage. For the information linked from DBPedia, use fetch-sparql-endpoint module and retrieve the correct annotations from the DBPedia SPARQL endpoint.

## Allowed Libraries
* CSS/Javascript: Bootstrap
* NPM Libraries: Passport, Express, node static, body parser, fetch, socket.io etc.
* All code and any libraries used in the labs and lectures (e.g. socket.io, Axios, etc.)
## Not Allowed Libraries
* Angular, React, React Native, Vue - note that server/browser frameworks will not be allowed
* Any languages building on top of Javascript and e.g. that requires compilation

## Getting Started
The following sections will guide you on how to set up the project locally.

npm install && npm run start

open the browser and type : localhost:3000


## Github: https://github.com/Skooooo/bird.git
