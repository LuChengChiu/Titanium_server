const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { TITANIUM_USER, TITANIUM_HOST, TITANIUM_PWD, TITANIUM_DB } = process.env;
const admin = require("../config/firebase-config");
// const mysql = require("mysql2");
const pool = require("../pool");
const bcrypt = require("bcrypt");

// pool.getConnection(function (err, connection) {
//   if (!err) {
//     console.log("DB is connected");
//   } else {
//     console.log("Error connecting DB", err);
//   }
// });
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
const saltRounds = 10;

router.get("/sessionCheck", async (req, res) => {
  console.log("WTF", req.cookies);
  const sessionCookie = req.cookies.serverSession;
  try {
    if (sessionCookie) {
      const response = await admin.auth().verifySessionCookie(sessionCookie);
      console.log(response);
      res.send({ message: "Session is still valid" });
    } else {
      res.status(401).send("Session Cookie doesn't exist/expired");
    }
  } catch (err) {
    console.log("/sessionCheck Error:", err);
    res.status(401).send({ message: `Session Cookie Error:${err}` });
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("serverSession");
    res.send({ message: "You've logout!" });
  } catch (err) {
    console.log(`/logout Error: ${err}`);
    res.status(401).send({ message: `LOGOUT Error:${err}` });
  }
});

router.post("/register", (req, res) => {
  const id = req.body.user_id;
  const email = req.body.email;
  const pwd = req.body.pwd;
  const cell = req.body.cell;
  const name = req.body.name;
  const bday = req.body.bday;
  try {
    /* Check Email if has been registered */
    pool.query(
      "SELECT * FROM titanium.membership WHERE email = ?",
      [email],
      (err, result) => {
        const checkEmailRegistered = result;
        if (checkEmailRegistered?.length > 0) {
          console.log("This email has been registered");
          res.status(409).send({ message: "This Email has been registered." });
        } else {
          console.log(
            "This is a new Email"
          ); /* Check Cell if has been registered */
          pool.query(
            "SELECT * FROM titanium.membership WHERE phone = ?",
            [cell],
            (err, result) => {
              const checkCellRegistered = result;
              if (checkCellRegistered?.length > 0) {
                console.log("This phone has been registered");
                res
                  .status(409)
                  .send({ message: "This Cellphone has been registered." });
              } else {
                console.log("This is a new Cellphone");
                // Password Hashing
                bcrypt.hash(pwd, saltRounds, (err, hash) => {
                  if (err) {
                    console.log("Pwd Hashing Error:", err);
                  } else {
                    pool.query(
                      "INSERT INTO titanium.membership (user_id,username, birthday, email, phone, password) VALUES (?,?,?,?,?,?)",
                      [id, name, bday, email, cell, hash],
                      (err, result) => {
                        if (err) {
                          console.log("Insert Data Error:", err);
                          return;
                        }
                        console.log("Register success");
                        res.send({
                          messgae: "Successfully signup in Mysql DB",
                        });
                      }
                    );
                  }
                });
              }
            }
          );
        }
      }
    );
  } catch (err) {
    console.log("Register Error:", err);
  }
});

router.post("/sessionLogin", (req, res) => {
  const { idToken, csrfToken } = req.body;
  if (csrfToken !== req.headers.xsrftoken) {
    res.status(401).send("UNAUTHORIZED REQUEST");
    console.log("stop");
    return;
  }
  console.log("M3 pass ");
  const expiresIn = 1000 * 60 * 60;
  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then((sessionCookie) => {
      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };
      res.cookie("session", sessionCookie, options);
      res.send({ sessionCookie: sessionCookie });
    })
    .catch((err) => {
      console.log("UNAUTHORIZED REQUEST! 401", err);
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

module.exports = router;
