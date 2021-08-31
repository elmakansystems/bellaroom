const InvProduct = require("../models/InvProduct");
const Product = require("../models/product");
const suppliers = require("../models/supplier");

const router = require("express").Router();

router.get("/", (req, res) => res.render("suppliers"));

router.get("/view_supplier", async (req, res) => {
  const supplier = await suppliers.find().sort("-_id");
  res.render("suppliers/view", { supplier });
});
router.get("/new_supplier", async (req, res) => {
  const supplier = await suppliers.find();
  res.render("suppliers/new", { supplier });
});

router.post("/new", async (req, res) => {
  const { name, address, phone } = req.body;
  let now = new Date(Date.now());

  try {
    let suppliers_data = {
      name,
      address,
      phone,
    };

    const supp = await new suppliers(suppliers_data);
    await supp.save();

    return res.status(201).redirect("/suppliers");
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/view/:id", async (req, res) => {
  try {
    const product = await Product.find({ dealer: req.params.id });
    const supplier = await suppliers.findById(req.params.id);

    return res
      .status(200)
      .render("suppliers/supplier_details", { product, supplier });
  } catch (error) {
    return res.status(404).render("error");
  }
});
router.get("/view/:id/:productid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productid);

    const supplier = await suppliers.findById(req.params.id);

    return res
      .status(200)
      .render("suppliers/edit_supplier", { product, supplier });
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/product/edit/:id/:soldID", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const sold_products = await InvProduct.find({ _id: req.params.soldID });
    return res
      .status(201)
      .render("products/edit_m", { product, sold: sold_products });
  } catch (error) {
    return res.status(404).render("error");
  }
});
router.post("/single/edit", async (req, res) => {
  const {
    id,
    soldID: _id,
    name,
    dealer,
    current_price,
    sold,
    date_added,
  } = req.body;
  const inv = await InvProduct.findById(_id);
  try {
    await InvProduct.updateOne({ _id }, { $set: { current_price, sold } });
    await Product.updateOne(
      { _id: id },
      { $set: { dealer, name, date_added } }
    );

    return res.status(201).redirect("/products/view_products/" + id);
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/single/edit", (req, res) =>
  res.redirect("/products/view_products")
);

router.get("/edit/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    return res.status(201).render("products/edit", { product });
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.post("/edit", async (req, res) => {
  const {
    id: _id,
    supplierid,
    addres,
    names,
    phones,
    paids,
    prices,
    product_name,
  } = req.body;
  const product = await Product.findById(_id);

  try {
    let name = names[0];
    let phone = phones[0];
    let address = addres[0];
    let paid = product.paid + parseFloat(paids[0]);

    await Product.updateOne({ _id }, { $set: { paid, name: product_name[0] } });
    await suppliers.updateOne(
      { _id: supplierid },
      { $set: { address, name, phone } }
    );

    return res.status(201).redirect("/suppliers/view/" + supplierid);
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/edit", (req, res) => res.redirect("/products/view_products"));

module.exports = router;
