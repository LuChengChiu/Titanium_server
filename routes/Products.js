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
pool.getConnection(function (err, connection) {
  if (!err) {
    console.log("DB is connected");
  } else {
    console.log("Error connecting DB", err);
  }
});
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
  try {
    pool.query("SELECT * FROM titanium.products;", (err, result) => {
      if (err) {
        console.log("/products GET /info Error:", err);
        return;
      }
      // console.log(result);
      res.send(result);
    });
  } catch (err) {
    console.log("/products GET /info Error:", err);
  }
});
router.post("/id", async (req, res) => {
  const id = req.body.id;
  try {
    const cloudResponse = await cloudinary.api.resources({
      type: "upload",
      prefix: `TITANIUM img/zippo${id}_`,
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
router.post("/ids", async (req, res) => {
  const ids = req.body.ids;
  try {
    const imgs = [];
    for (let i = 0; i < ids.length; i++) {
      const cloudResponse = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${ids[i]}_`,
        max_results: ids.length * 4,
      });
      imgs.push(cloudResponse.resources);
    }
    console.log(imgs);
    pool.query(
      "SELECT * FROM titanium.products WHERE product_id IN (?);",
      [ids],
      (err, result) => {
        console.log("product info", result);
        res.send({ info: result, imgs: imgs });
      }
    );
  } catch (err) {
    console.log("/prouducts POST /id Error:", err);
  }
});
router.post("/side", async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    var [frontId, backId] = [id - 1, id + 1];
    console.log(frontId, backId);
    if (frontId == 0) {
      var frontId = 16;
      const img = [];
      const cloudF = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${frontId}_`,
        max_results: 1,
      });
      img.push(cloudF.resources[0]);
      const cloudB = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${backId}_`,
        max_results: 1,
      });
      img.push(cloudB.resources[0]);
      const newImg = img.map(({ public_id, secure_url }) => ({
        public_id,
        secure_url,
      }));
      res.send(newImg);
    } else if (backId == 17) {
      var backId = 1;
      const img = [];
      const cloudF = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${frontId}_`,
        max_results: 1,
      });
      img.push(cloudF.resources[0]);
      const cloudB = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${backId}_`,
        max_results: 1,
      });
      img.push(cloudB.resources[0]);
      const newImg = img.map(({ public_id, secure_url }) => ({
        public_id,
        secure_url,
      }));
      res.send(newImg);
    } else {
      const img = [];
      const cloudF = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${frontId}_`,
        max_results: 1,
      });
      img.push(cloudF.resources[0]);
      const cloudB = await cloudinary.api.resources({
        type: "upload",
        prefix: `TITANIUM img/zippo${backId}_`,
        max_results: 1,
      });
      img.push(cloudB.resources[0]);
      const newImg = img.map(({ public_id, secure_url }) => ({
        public_id,
        secure_url,
      }));
      res.send(newImg);
    }
  } catch (err) {
    console.log("/products/side POST Error:", err);
  }
});
module.exports = router;
