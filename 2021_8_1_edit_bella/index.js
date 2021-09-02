const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");

require("colors");

const cookieParser = require("cookie-parser");
const {
  isNotAuth,
  isAdmin,
  isActive,
  isLogged,
  isBoth,
  logged_user,
} = require("./middlewares/auth");

mongoose
  .connect(process.env.URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("> Connected...".cyan))
  .catch((err) =>
    console.log(
      `> Error while connecting to mongoDB : ${err.message}`.underline.red
    )
  );

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(express.static("public"));

app.use(logged_user);

app.get("/", isLogged, isActive, isBoth, (req, res) => {
  let { admin, editor } = req.user_type;
  res.render("home", { admin, editor });
});

app.get("/logout", isLogged, (req, res) => {
  res.cookie("_ms_in", "", { maxAge: 1 });
  res.redirect("/login");
});

// app.use('/settings/', isLogged, isActive, isAdmin, require('./routes/settings'))
// app.use('/clients/', isLogged, isActive, isBoth, require('./routes/clients'))
// app.use('/invoices/', isLogged, isActive, isBoth, require('./routes/invoices'))
// app.use('/receipt/', isLogged, isActive, isBoth, require('./routes/receipt'))
// app.use('/orders/', isLogged, isActive, isBoth, require('./routes/custom-order'))
// app.use('/workers/', isLogged, isActive, require('./routes/workers'))
// app.use('/attendance/', isLogged, isActive, require('./routes/attendance'))
// app.use('/purchases/', isLogged, isActive, isAdmin, require('./routes/purchases'))
// app.use('/products/', isLogged, isActive, isAdmin, require('./routes/products'))
// app.use('/safe/', isLogged, isActive, isAdmin, require('./routes/safe_view'))
// app.use('/loan/', isLogged, isActive, isAdmin, require('./routes/loan'))
// app.use('/user', isLogged, isActive, require("./routes/user"))
// app.get('/forbidden', (req, res) => res.render("forbidden"))
// app.use('/', isNotAuth, require("./routes/users.js"))
// app.get('*', isLogged, (req, res) => res.render('error'))

app.use(
  "/settings/",
  isLogged,
  isActive,
  isAdmin,
  require("./routes/settings")
);
app.use('/clients/', isLogged, isActive, isBoth, require('./routes/clients'))
app.use("/invoices/", isLogged, isActive, require("./routes/invoices"));
app.use("/receipt/", isLogged, isActive, require("./routes/receipt"));
app.use("/orders/", isLogged, isActive, require("./routes/custom-order"));
app.use("/workers/", isLogged, isActive, require("./routes/workers"));
app.use("/attendance/", isLogged, isActive, require("./routes/attendance"));
app.use(
  "/purchases/",
  isLogged,
  isActive,
  isAdmin,
  require("./routes/purchases")
);
app.use(
  "/products/",
  isLogged,
  isActive,
  isAdmin,
  require("./routes/products")
);
app.use("/safe/", isLogged, isActive, isAdmin, require("./routes/safe_view"));
app.use("/printfile/", isLogged, isActive, isAdmin, require("./routes/printfile"));
app.use("/analysis/", isLogged, isActive, isAdmin, require("./routes/analysis"));
app.use("/loan/", isLogged, isActive, isAdmin, require("./routes/loan"));
app.use("/user", isLogged, isActive, require("./routes/user"));
app.get("/forbidden", (req, res) => res.render("forbidden"));
app.use("/", isNotAuth, require("./routes/users.js"));
app.get("*", isLogged, (req, res) => res.render("error"));

app.listen(port, () =>
  console.log("> Server is up and running on http://localhost:" + port)
);
