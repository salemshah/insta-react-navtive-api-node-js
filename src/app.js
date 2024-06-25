const express = require("express");
const path = require('path')
require("dotenv").config({path: path.resolve(__dirname + '/../.env')});
const fs = require('fs')
const mongoose = require("mongoose");
const catchError = require('./helper/catchError')
const cookieParser = require('cookie-parser')


// ------------------------------------ constants -------------------------------------------
const port = process.env.PORT
const origin = process.env.ORIGIN
const origin1 = process.env.ORIGIN_1
const app = express();

// ------------------------------------ middlewares -----------------------------------------
app.use(express.json());
app.use(cookieParser())
app.set('trust proxy', true)

const allowedOrigins = [origin, origin1];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// ------------------------------------ dynamic routes ---------------------------------------
// require dynamic routes
const dirPath = __dirname + "/routes";
fs.readdirSync(dirPath).map((file) => {
    try {
        if (fs.existsSync(`${dirPath}/${file}`)) app.use("/api", require(`${dirPath}/${file}`));
    } catch (err) {
        logger.error(err);
    }
});

// error handling
app.use((err, req, res, next) => {
    catchError(err, req, res, next);
});

// start server
const dbUri = process.env.DB_URI

mongoose.connect(dbUri).then(async () => {
    console.info("DB connected");
    app.listen(port, async () => {
        console.info(`App is running at http://localhost:${port}`);
    });
}).catch(() => {
    console.error("Could not connect to db");
    process.exit(1);

})



