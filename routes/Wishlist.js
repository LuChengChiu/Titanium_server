const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { TITANIUM_USER, TITANIUM_HOST, TITANIUM_PWD, TITANIUM_DB } = process.env;
// const mysql = require("mysql2");
const pool = require("../pool");
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
router.post("/", (req, res) => {
  try {
    const userId = req.body.userId;
    const query = "SELECT * FROM titanium.wishlist WHERE user_id = ?;";
    pool.query(query, [userId], (err, result) => {
      if (err) {
        console.log("wishlist query Error:", err);
        return;
      }
      console.log(result);
      res.send(result);
    });
  } catch (err) {
    console.log("/wishlist/ POST Error:", err);
  }
});
router.post("/check", (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;
  pool.query(
    "SELECT * FROM titanium.wishlist WHERE user_id = ? AND product_id = ?;",
    [userId, productId],
    (err, result) => {
      if (err) {
        console.log("checkwishlist Error:", err);
      }
      if (result.length == 0) {
        console.log("This product isn't in wishlist");
        res.send({ inWishlist: false });
      } else {
        console.log("This product is in wishlist");
        res.send({ inWishlist: true });
      }
      console.log("checkwishlist result:", result);
    }
  );
});
router.post("/change", (req, res) => {
  try {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const inWishlist = req.body.wishlist;
    console.log("/wishlistChange inWishlist:", inWishlist);
    if (!inWishlist) {
      pool.query(
        "INSERT INTO titanium.wishlist (user_id, product_id) VALUES (?,?);",
        [userId, productId],
        (err, result) => {
          if (err) {
            console.log("Insert wishlist Error:", err);
          }
          if (result) {
            console.log("Add to wishlist successfully");
            res.send({ inWishlist: true });
          }
        }
      );
    } else {
      pool.query(
        "DELETE FROM titanium.wishlist WHERE user_id = ? AND product_id = ?;",
        [userId, productId],
        (err, result) => {
          if (err) {
            console.log("Delete wishlist Error:", err);
          }
          if (result) {
            console.log("Delete from wishlist successfully");
            res.send({ inWishlist: false });
          }
        }
      );
    }
  } catch (err) {
    console.log("/wishlist/change POST Error:", err);
  }
});

module.exports = router;
