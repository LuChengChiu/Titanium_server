const express = require("express");
const router = express.Router();
// const mysql = require("mysql2");
const pool = require("../pool");
const cloudinary = require("cloudinary").v2;
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  TITANIUM_USER,
  TITANIUM_HOST,
  TITANIUM_PWD,
  TITANIUM_DB,
} = process.env;
// pool.getConnection(function (err, connection) {
//   if (!err) {
//     console.log("DB is connected");
//   } else {
//     console.log("Error connecting DB", err);
//   }
// });
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
// const database = mysql.createConnection({
//   user: TITANIUM_USER,
//   host: TITANIUM_HOST,
//   password: TITANIUM_PWD,
//   database: TITANIUM_DB,
// });
// const { CLOUD_SQL_USER, CLOUD_SQL_HOST, CLOUD_SQL_PWD, CLOUD_SQL_DB } =
//   process.env;
// const database = mysql.createConnection({
//   user: CLOUD_SQL_USER,
//   host: CLOUD_SQL_HOST,
//   password: CLOUD_SQL_PWD,
//   database: CLOUD_SQL_DB,
// });
router.get("/", async (req, res) => {
  try {
    const cloudResponse = await cloudinary.api.resources({
      type: "upload",
      prefix: "TITANIUM img/",
      max_results: 50,
    });
    // console.log(cloudResponse?.resources.length);
    res.send(cloudResponse.resources);
  } catch (err) {
    console.log("/products GET Error:", err);
  }
});

router.get("/info", (req, res) => {
  pool.query("SELECT * FROM titanium.products;", (err, result) => {
    if (err) {
      console.log("/products GET /info Error:", err);
      return;
    }
    // console.log(result);
    res.send(result);
  });
});
router.post("/id", async (req, res) => {
  const id = req.body.id;
  try {
    const cloudResponse = await cloudinary.api.resources({
      type: "upload",
      prefix: `TITANIUM img/zippo${id}`,
      max_results: 50,
    });
    pool.query(
      "SELECT * FROM titanium.products WHERE product_id = ?;",
      [id],
      (err, result) => {
        console.log("product info", result);
        res.send({ info: result[0], imgs: cloudResponse.resources });
      }
    );
  } catch (err) {
    console.log("/prouducts POST /id Error:", err);
  }
});

module.exports = router;
