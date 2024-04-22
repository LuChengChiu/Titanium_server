const express = require("express");
const cors = require("cors");
const middleware = require("./middleware");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
// Middleware setup
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(middleware.decodeToken);

module.exports = app;
