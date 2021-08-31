const InvProduct = require("../models/InvProduct");
const Product = require("../models/product");
const suppliers = require("../models/supplier");
const buyproducts = require("../models/buyproduct");

const router = require("express").Router();

router.get("/", (req, res) => res.render("products"));

router.get("/new_part", async (req, res) => {
  const supplier = await suppliers.find().select("name").sort("_id");
  const products = await Product.find();
  res.render("products/new_part", { supplier, products });
});
router.get("/new_product", async (req, res) => {
  const supplier = await suppliers.find().select("name");
  res.render("products/new_product", { supplier });
});

router.post("/new", async (req, res) => {
  const { names, dealers, paid, prices, part_type } = req.body;

  const supplier = await suppliers.find();
  let tests = [];

  supplier.forEach((elem) => {
    tests.push(elem._id, elem.total_price, elem.total_paid);
  });
  let now = new Date(Date.now());

  try {
    for (let index = 0; index < names.length; index++) {
      let product_data = {
        name: names[index],
        dealer: dealers[index],
        p_type: part_type[index],
        now,
      };
      const product = await new Product(product_data);
      await product.save();
    }
    return res.status(201).redirect("/products");
  } catch (error) {
    return res.status(404).render("error");
  }
});
router.post("/old_new_product", async (req, res) => {
  console.log(req.body)
  const { products, count, unit_prices, total_paid , total_need } = req.body;

 

  let now = new Date(Date.now());

  try {
    for (let index = 0; index < products.length; index++) {
      let product_data = {
        p_id: products[index],
        price: unit_prices[index],
        paid: total_paid[index],
        p_count: count[index],
        inv_p_count: count[index],
        now,
      };
      const buy_product = await new buyproducts(product_data);
      console.log(buy_product);
      await buy_product.save();
    }
    return res.status(201).redirect("/products");
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/view_products", async (req, res) => {
  try {
    const products = await Product.find().sort("-_id");
    const supplier = await suppliers.find();

    if (products) {
      return res
        .status(200)
        .render("products/view_products", { products, supplier });
    } else throw new Error("no product found");
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/view_products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const sold_products = await InvProduct.find({ product_id: req.params.id });
    const supplier = await suppliers.find();
    if (product) {
      return res.status(200).render("products/product_details", {
        product,
        sold: sold_products,
        supplier,
      });
    } else throw new Error("no product found");
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/product/edit/:id/:soldID", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const sold_products = await InvProduct.find({ _id: req.params.soldID });
    const supplier = await suppliers.find();
    return res
      .status(201)
      .render("products/edit_m", { product, sold: sold_products, supplier });
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
  const { id: _id, names, prices } = req.body;
  try {
    let name = names[0];

    let price = prices[0];

    await Product.updateOne({ _id }, { $set: { name, price } });

    return res.status(201).redirect("/products/view_products");
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/edit", (req, res) => res.redirect("/products/view_products"));

module.exports = router;
