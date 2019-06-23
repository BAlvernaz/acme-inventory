const express = require("express");
const app = express();
const Sequelize = require("sequelize");
const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_inventory_db"
);
const PORT = process.env.PORT || '3000'
const path = require('path')

const Products = db.define("products", {
  name: Sequelize.STRING,
  status: {
    type: Sequelize.ENUM,
    values: ["INSTOCK", "BACKORDERED", "DISCONTINUED"]
  }
});

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const products = [
    {
    name: "Foo",
    status: "INSTOCK"
    },
    {
      name: "Bar",
      status:"INSTOCK"
    },
    {
      name: "Bazz",
      status: "BACKORDERED"
    },
    {
      name: "Quq",
      status: "DISCONTINUED"
    }
  ]
  await Promise.all(products.map(product => Products.create(product)))
};

app.use(express.json())
app.use(express.urlencoded())

app.get('/api/products', async (req, res, next) => {
  try {
    const allProducts = await Products.findAll()
    res.send(allProducts)

  } catch(ex){
    next(ex)
  }
})

app.get('/', async (req, res, next) => {
 res.sendFile(path.join(__dirname, 'index.html'))
})

app.put('/api/products/:id', async (req, res, next) => {
  try {
  await Products.update(
    {status:req.body.status},
    {where: {
      id: req.params.id
    }
    })
    res.sendStatus(204)
  } catch(ex) {
    next(ex)
  }
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
