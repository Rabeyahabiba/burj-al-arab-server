const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
// console.log(process.env.DB_PASS)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zroly.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = 5005
const app = express()

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("working")
})


var serviceAccount = require("./configs/burj-f0958-firebase-adminsdk-lmjq3-15cad1059e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // firebase database url link missing in my firebase //
});




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                  if (tokenEmail ==  queryEmail) {
                    bookings.find({email:  queryEmail })
                    .toArray(( err, documents) => {
                        res.status(200).send(documents);
                    })
                  }
                  else {
                    res.status(401).send('unauthorized access')
                  }
                })
                .catch((error) => {
                    res.status(401).send('unauthorized access')
                });
        } 
        else {
            res.status(401).send('unauthorized access')
        }    
    })
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)
