const dotenv = require("dotenv");
dotenv.config();
const { PORT } = process.env;
const app = require("./app");
const productsRoute = require("./routes/Products");
const userRoute = require("./routes/User");
const cartRoute = require("./routes/Cart");
const wishlistRoute = require("./routes/Wishlist");
const orderRoute = require("./routes/Order");

app.use("/user", userRoute);
app.use("/products", productsRoute);
app.use("/cart", cartRoute);
app.use("/wishlist", wishlistRoute);
app.use("/order", orderRoute);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
