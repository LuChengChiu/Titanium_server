const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const pool = require("../pool");

// const { TITANIUM_USER, TITANIUM_HOST, TITANIUM_PWD, TITANIUM_DB } = process.env;
// const { CLOUD_SQL_USER, CLOUD_SQL_HOST, CLOUD_SQL_PWD, CLOUD_SQL_DB } =
//   process.env;
// const database = mysql.createConnection({
//   user: TITANIUM_USER,
//   host: TITANIUM_HOST,
//   password: TITANIUM_PWD,
//   database: TITANIUM_DB,
// });
// const database = mysql.createConnection({
//   user: "root",
//   host: "130.211.255.224",
//   password: "",
//   database: "titanium",
// });
// pool.getConnection(function (err, connection) {
//   if (!err) {
//     console.log("DB is connected");
//   } else {
//     console.log("Error connecting DB", err);
//   }
// });
router.post("/", (req, res) => {
  try {
    const userId = req.body.userId;
    pool.query(
      "SELECT * FROM titanium.orders WHERE user_id = ?;",
      [userId],
      (err, result) => {
        if (err) {
          console.log("query-find order error: ", err);
          return;
        }
        if (result) {
          console.log(`User ${userId} Order:`, result);
          res.send(result);
        }
      }
    );
  } catch (err) {
    console.log("/order/ POST Error: ", err);
  }
});

router.post("/create", (req, res) => {
  try {
    const userId = req.body.userId;
    const orderNo = req.body.orderNo;
    const totalValue = req.body.sum;
    const logisticId = req.body.logistic;
    const paymentId = req.body.payment;
    console.log(userId, orderNo, totalValue, logisticId, paymentId);
    pool.query(
      "INSERT INTO titanium.orders (order_id, user_id, total_value, logistic_id, payment_method_id) VALUES (?, ?, ?, ?, ?);",
      [orderNo, userId, totalValue, logisticId, paymentId],
      (err, result) => {
        if (err) {
          console.log("query-create order error: ", err);
          return;
        }
        if (result) {
          console.log(`User ${userId} Create new order:`, result);
          res.send({ message: "Order created successfully" });
        }
      }
    );
  } catch (err) {
    console.log("/order/create POST Error:", err);
  }
});
router.get("/cloud", async (req, res) => {
  try {
    const query = "SELECT * FROM titanium.orders;";
    pool.query(query, (err, results) => {
      if (!results) {
        res.send({ message: "No result" });
      } else {
        res.send(results);
      }
    });
  } catch (err) {
    console.log("ERROR CLOUD", err);
  }
});

module.exports = router;
