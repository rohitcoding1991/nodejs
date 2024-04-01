const express = require("express");
const app = express();
require("dotenv").config();
let db = require("./db");
let routesUser = require("./router/user");
const port = process.env.PORT || 3000;
app.use(express.urlencoded());
app.use(express.json());
app.use("/", routesUser);
app.listen(port, () => {
  console.log(`server is runnig on port ${port}`);
});
