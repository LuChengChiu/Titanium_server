const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
// const mysql = require("mysql2");
const pool = require("../pool");
const ecpay_logistics = require("ecpay_logistics_nodejs");
const ecpay_payment = require("ecpay_aio_nodejs");

dotenv.config();
const {
  TITANIUM_USER,
  TITANIUM_HOST,
  TITANIUM_PWD,
  TITANIUM_DB,
  HOST,
  MERCHANTID,
  HASHKEY,
  HASHIV,
} = process.env;
// const { CLOUD_SQL_USER, CLOUD_SQL_HOST, CLOUD_SQL_PWD, CLOUD_SQL_DB } =
//   process.env;
// const database = mysql.createConnection({
//   user: CLOUD_SQL_USER,
//   host: CLOUD_SQL_HOST,
//   password: CLOUD_SQL_PWD,
//   database: CLOUD_SQL_DB,
// });

// const database = mysql.createConnection({
//   user: TITANIUM_USER,
//   host: TITANIUM_HOST,
//   password: TITANIUM_PWD,
//   database: TITANIUM_DB,
// });
const ecpay_options = {
  OperationMode: "Test", //Test or Production
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV,
  },
  IgnorePayment: [
    //    "Credit",
    //    "WebATM",
    //    "ATM",
    //    "CVS",
    //    "BARCODE",
    //    "AndroidPay"
  ],
  IsProjectContractor: false,
};
let TradeNo;
// Cart Process
router.get("/delivery", (req, res) => {
  pool.query("SELECT * FROM titanium.logistics;", (err, result) => {
    if (err) {
      console.log("GET-deliveryMethod Error:", err);
    }
    res.send(result);
  });
});
router.get("/payment", (req, res) => {
  pool.query("SELECT * FROM titanium.payment_method;", (err, result) => {
    if (err) {
      console.log("GET-paymentMethod Error:", err);
    }
    res.send(result);
  });
});
// Cart adjust
router.post("/", (req, res) => {
  const userId = req.body.userId;
  try {
    pool.query(
      "SELECT * FROM titanium.shopping_cart WHERE user_id = ?;",
      [userId],
      (err, result) => {
        if (err) {
          console.log("query-find cart Error:", err);
          return;
        }
        if (result) {
          console.log("User Cart:", result);
          res.send(result);
        }
      }
    );
  } catch (err) {
    console.log("/cart Error:", err);
  }
});
router.post("/add", (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;
  const productQ = req.body.productQ;
  try {
    if (userId) {
      pool.query(
        "INSERT INTO titanium.shopping_cart (user_id, product_id, quantity) VALUES (?,?,?);",
        [userId, productId, productQ],
        (err, result) => {
          if (err) {
            console.log("Insert to Cart Error:", err);
          }
          if (result) {
            console.log(
              `User:${userId} add product-${productId}*${productQ} to cart!`
            );
            res.send({ cart: [productId, productQ] });
          }
        }
      );
    } else {
      console.log("Can't add to cart since u hasn't logged in");
    }
  } catch (err) {
    console.log("POST - Add Cart Error:", err);
  }
});
router.post("/remove", (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;
  try {
    if (userId) {
      pool.query(
        "DELETE FROM titanium.shopping_cart WHERE user_id = ? AND product_id = ? ;",
        [userId, productId],
        (err, result) => {
          if (err) {
            console.log("Remove from Cart Error:", err);
          }
          if (result) {
            console.log(
              `User:${userId} remove product-${productId} from cart!`
            );
            res.send({ message: "Product successfully removed" });
          }
        }
      );
    } else {
      console.log("Can't add to cart since u hasn't logged in");
    }
  } catch (err) {
    console.log("POST - Remove Cart Error:", err);
  }
});
// Ecpay
router.post("/map", (req, res) => {
  console.log("MMMMMMMMMMMMMMMMMMMMMMMM");
  try {
    const logisticsSubType = req.body.LogisticsSubType;
    const isCollection = req.body.IsCollection;
    TradeNo = "test" + new Date().getTime();
    const data = {
      MerchantTradeNo: TradeNo,
      ServerReplyURL: `${HOST}/cart/orderSuccess`,
      LogisticsType: "CVS",
      LogisticsSubType: logisticsSubType,
      IsCollection: isCollection,
      ExtraData: "",
      Device: "",
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(data),
      withCredentials: true,
    };
    let create = new ecpay_logistics();
    let html = create.query_client.expressmap((parameter = data));
    console.log(logisticsSubType, isCollection);
    console.log("START", html, "END");
    res.send(html);
  } catch (err) {
    console.log("/cart/map POST Error:", err);
  }
});
router.post("/ecpay", (req, res) => {
  const amount = req.body.amount;
  const trade = req.body.itemDescription;
  const item = req.body.allItems;
  const logisticsSubType = req.body.LogisticsSubType;
  try {
    const MerchantTradeDate = new Date().toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
    TradeNo = "test" + new Date().getTime();
    let base_param = {
      MerchantTradeNo: TradeNo, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
      MerchantTradeDate,
      TotalAmount: amount,
      TradeDesc: trade,
      ItemName: item,
      ReturnURL: `${HOST}/return`,
      ClientBackURL: `${HOST}/cart/${logisticsSubType}`,
    };
    const create = new ecpay_payment(ecpay_options);
    // 注意：在此事直接提供 html + js 直接觸發的範例，直接從前端觸發付款行為
    const html = create.payment_client.aio_check_out_all(base_param);
    console.log(html);
    console.log(HOST);
    res.send(html);
  } catch (err) {
    console.log("/cart/ecpay POST Error:", err);
  }
});
router.post("/return", (req, res) => {
  console.log("req.body:", req.body);
  const { CheckMacValue } = req.body;
  const data = { ...req.body };
  delete data.CheckMacValue; // 此段不驗證

  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

  console.log(
    "確認交易正確性：",
    CheckMacValue === checkValue,
    CheckMacValue,
    checkValue
  );

  // 交易成功後，需要回傳 1|OK 給綠界
  res.send("1|OK");
});
module.exports = router;
