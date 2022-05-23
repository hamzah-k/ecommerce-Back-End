const { Router } = require('express');
const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers')


// Get all products



/* GET home page. */
router.get('/', function(req, res) {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1; //set the current page number
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; //set the limit of items per pafe
    //of products
    let startValue;
    let endValue

    if (page > 0) {
        startValue = (page * limit) - limit; //0,10,20,30
        endValue = page * limit;

    } else {
        startValue = 0;
        endValue = 10;
    }

    database.table('products as p').join([{
        table: 'categories as c',
        on: 'c.id = p.cat_id'
    }]).withFields([
        'c.title as category',
        'p.title as name',
        'p.price',
        'p.description',
        'p.quantity',
        'p.image',
        'p.id'
    ]).slice(startValue, endValue).sort({ id: .1 }).getAll().then((prods) => {
        if (prods.length > 0) {
            res.status(200).json({
                count: prods.length,
                products: prods
            });
        } else {
            res.json({ message: "No products found" })
        }
    }).catch(err => console.log(err))

});

/*get single product */


router.get('/:prodId', (req, res) => {

    //fetch data from the param


    let prodctId = req.params.prodId;
    //console.log(prodctId);


    database.table('products as p').join([{
        table: 'categories as c',
        on: 'c.id = p.cat_id'
    }]).withFields([
        'c.title as category',
        'p.title as name',
        'p.price',
        'p.description',
        'p.quantity',
        'p.image',
        'p.images',
        'p.id'
    ]).filter({ 'p.id': prodctId }).get().then((prod) => {
        if (prod) {
            res.status(200).json(prod);
        } else {
            res.json({ message: 'No product found Matched with the product id ' + prodctId });
        }
    }).catch(err => console.log(err))



})

/*get all products from particular category*/

router.get('/category/:catname', (req, res) => {

    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1; //set the current page number
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; //set the limit of items per pafe
    //of products
    let startValue;
    let endValue
        //Fetch the category name from the url
    let catName = req.params.catname;

    if (page > 0) {
        startValue = (page * limit) - limit; //0,10,20,30
        endValue = page * limit;

    } else {
        startValue = 0;
        endValue = 10;
    }

    database.table('products as p').join([{
        table: 'categories as c',
        on: "c.id = p.cat_id where c.title Like '%" + catName + "%'"
    }]).withFields([
        'c.title as category',
        'p.title as name',
        'p.price',
        'p.description',
        'p.quantity',
        'p.image',
        'p.id'
    ]).slice(startValue, endValue).sort({ id: .1 }).getAll().then((prods) => {
        if (prods.length > 0) {
            res.status(200).json({
                count: prods.length,
                products: prods
            });
        } else {
            res.json({ message: "No products found from " + catName + " category" })
        }
    }).catch(err => console.log(err))

});





module.exports = router;