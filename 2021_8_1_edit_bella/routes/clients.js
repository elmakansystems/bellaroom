const router = require("express").Router();
const invoice = require("../models/invoice");

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
    .select("name phone paid change date_added")
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

router.get("/edit/:id", async (req, res) => {
  try {
    const clients = await invoice.findById(req.params.id).sort("-_id");
    if (clients)
      return res.status(201).render("clients/edit", {
        name: clients.name,
        _id: clients._id,
        change: clients.change,
        sub: clients.sub || [0],
        paid: clients.paid,
      });
    else throw new Error("no data found");
  } catch (error) {
    return res.status(404).render("error");
  }
});
router.get("/edit", async (req, res) =>
  res.status(201).redirect("/clients/change")
);

router.post("/edit", async (req, res) => {
  let { id, sub, change, paid } = req.body;
  let subs = sub.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) || 0;

  let updated_change = parseFloat(change) - parseFloat(subs);
  let updated_paid = parseFloat(paid) + parseFloat(subs);

  try {
    await invoice.updateOne(
      { _id: id },
      {
        $set: {
          sub,
          change: updated_change,
          paid: updated_paid,
        },
      }
    );

    return res.status(201).redirect("/clients/change");
  } catch (error) {
    return res.status(404).render("error");
  }
});

module.exports = router;
