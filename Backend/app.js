
//kpwjxW27lgNV8dVx

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./Routes/AdvertisementRoutes');
const app = express();


//Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/Advertisement", routes);



//Connect to MongoDB
mongoose.connect("mongodb+srv://admin:kpwjxW27lgNV8dVx@cluster0.z7i0ogj.mongodb.net/")
    .then(() => console.log("Connected to MongoDB"))
    .then(() => {
        app.listen(5000);

    })
    .catch((err) => console.log(err));