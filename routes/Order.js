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
    const logisticId = req.body.LogisticsSubType;
    const paymentId = req.body.IsCollection;
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
router.post("/createItem", (req, res) => {
  try {
    const value = req.body.values4Item;
    pool.query(
      "INSERT INTO titanium.order_items (order_item_id, order_id, product_id, quantity, price_per_item, subtotal) VALUES ?;",
      [value],
      (err, result) => {
        if (err) {
          console.log("query-create orderItem error: ", err);
          return;
        }
        if (result) {
          console.log(result);
          res.send({ message: "OrderItem created successfully" });
        }
      }
    );
  } catch (err) {
    console.log("/order/createItem POST Error:", err);
  }
});

router.post("/id", (req, res) => {
  try {
    const id = req.body.orderId;
    const query = "SELECT * FROM titanium.orders WHERE order_id = ?;";
    pool.query(query, [id], (err, result) => {
      if (err) {
        console.log("query order id Error:", err);
        return;
      }
      console.log("order id result: ", result);
      res.send(result);
    });
  } catch (err) {
    console.log("/order/id POST Error:", err);
  }
});
router.post("/item", (req, res) => {
  try {
    const id = req.body.orderId;
    const query = "SELECT * FROM titanium.order_items WHERE order_id = ?;";
    pool.query(query, [id], (err, result) => {
      if (err) {
        console.log("query order item Error:", err);
        return;
      }
      console.log("order item result: ", result);
      res.send(result);
    });
  } catch (err) {
    console.log("/order/item POST Error:", err);
  }
});

module.exports = router;
