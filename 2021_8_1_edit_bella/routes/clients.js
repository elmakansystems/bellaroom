const router = require("express").Router();
const invoice = require("../models/invoice");
const Change = require("../models/Change");
router.get("/", (req, res) => res.render("clients"));

router.get("/view", async (req, res) => {
  const clients = await invoice
    .find({})
    .populate("products", "name -_id")
    .select("name phone location paid products -_id")
    .sort("-_id")
    .then((result) => {
      let filtered = [];
      result.forEach((elem, i) => {
        if (filtered.length == 0) {
          filtered.push(elem.name);
        } else {
          if (!filtered.includes(elem.name)) {
            filtered.push(elem.name);
          }
        }
      });

      res.status(200).render("clients/view", { clients: result, filtered });
    })

    .catch((err) => {
      console.log("=".repeat(50));
      console.log(err.message);
      console.log("=".repeat(50));
      res.status(404).render("error");
    });
});

router.get("/change", async (req, res) => {
  const change = await invoice
  
    .find({})
    .select("name phone last_paid last_change date_added")
    .then((result) =>
      res.status(200).render("clients/change", { change: result })
    )

    .catch((err) => {
      console.log("=".repeat(50));
      console.log(err.message);
      console.log("=".repeat(50));
      res.status(404).render("error");
    });
});
router.get("/paid", async (req, res) => {
  const change = await invoice
  
    .find({})
    .select("name phone last_paid last_change date_added")
    .sort("-_id")
    .then((result) =>
      res.status(200).render("clients/paid", { change: result })
    )

    .catch((err) => {
      console.log("=".repeat(50));
      console.log(err.message);
      console.log("=".repeat(50));
      res.status(404).render("error");
    });
});
router.get("/edit/:id", async (req, res) => {
  try {
    const clients = await invoice.findById(req.params.id);
    const serial = await Change.find({id:req.params.id}).countDocuments() + 1 || 0
    if (clients)
      return res.status(201).render("clients/edit", {
        name: clients.name,
        _id: clients._id,
        invId:clients.invId,
        total_price:clients.total_price,
        last_change: clients.last_change,
        sub: clients.sub || [0],
        last_paid: clients.last_paid,
        serial,
      });
    else throw new Error("no data found");
  } catch (error) {
    return res.status(404).render("error");
  }
});


router.post("/edit", async (req, res) => {
  let { id, sub, last_change, last_paid ,serial  } = req.body;
  let subs = sub.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) || 0;

  let updated_change = parseFloat(last_change) - parseFloat(subs);
  let updated_paid = parseFloat(last_paid) + parseFloat(subs);
  
  try {
    let new_change = {
       payment_change:updated_change,
       payment_paid :parseFloat(subs),
       serial,
       id 
  }

  const change = await new Change(new_change)
  await change.save()
    await invoice.updateOne(
      { _id: id },
      {
        $set: {
          last_change: updated_change,
          last_paid: updated_paid,

        },
      }
    );

    return res.status(201).redirect("/clients/change");
  } catch (error) {
    return res.status(404).render("error");
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    const clients = await invoice.findById(req.params.id).sort("-_id");
    const change = await Change.find({id:req.params.id}).sort("-_id");
    

    if (clients)
      return res.status(201).render("clients/details", {
        name: clients.name,
        _id: clients._id,
        invId:clients.invId,
        phone:clients.phone,
        total_total:clients.total_total,
        change,
      

      });
    else throw new Error("no data found");
  } catch (error) {
    return res.status(404).render("error");
  }
});
router.get("/payment-card/:id", async(req, res) =>{
  try{
  const change = await Change.findById(req.params.id)
  const clients = await invoice.findById(change.id)
  if (change)return res.status(201).render("clients/payment-card", {
    name: clients.name,
    _id: clients._id,
    invId:clients.invId,
    phone:clients.phone,
    total_total:clients.total_total,
    payment_change:change.payment_change,
    payment_paid:change.payment_paid,
    serial:change.serial,
    date :change.date_added
 
 

  });
else throw new Error("no data found");
} catch (error) {
return res.status(404).render("error");
}
})



module.exports = router;
