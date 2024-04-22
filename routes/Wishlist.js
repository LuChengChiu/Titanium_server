const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { TITANIUM_USER, TITANIUM_HOST, TITANIUM_PWD, TITANIUM_DB } = process.env;
const mysql = require("mysql2");
const database = mysql.createConnection({
  user: TITANIUM_USER,
  host: TITANIUM_HOST,
  password: TITANIUM_PWD,
  database: TITANIUM_DB,
});

router.post("/check", (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;
  database.query(
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
  const userId = req.body.userId;
  const productId = req.body.productId;
  const inWishlist = req.body.wishlist;
  console.log("/wishlistChange inWishlist:", inWishlist);
  if (!inWishlist) {
    database.query(
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
    database.query(
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
});

module.exports = router;
