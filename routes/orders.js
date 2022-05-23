const { Router } = require('express');
const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers')

/*Get all Orders */

router.get('/', (req, res) => {
        database.table('orders_details as od')
            .join([{
                    table: "orders as O",
                    on: 'O.id = od.order_id'
                },
                {
                    table: 'products as p',
                    on: 'p.id = od.product_id'
                },
                {
                    table: 'users as u',
                    on: 'u.id = O.user_id'
                }
            ]).withFields(['O.id', 'p.title as name', 'p.description', 'p.price', 'u.username']).sort({ id: .1 })
            .getAll().then((orders) => {
                if (orders.length > 0) {
                    res.status(200).json(orders);
                } else {
                    res.json({ message: "No orders found" });
                }
            }).catch((err) => console.log(err))
    })
    /*GET SINGLE ORDERS */
router.get('/:id', (req, res) => {
        const orderId = req.params.id;

        database.table('orders_details as od')
            .join([{
                    table: "orders as O",
                    on: 'O.id = od.order_id'
                },
                {
                    table: 'products as p',
                    on: 'p.id = od.product_id'
                },
                {
                    table: 'users as u',
                    on: 'u.id = O.user_id'
                }
            ]).withFields(['O.id', 'p.title as name', 'p.description', 'p.price', 'od.quantity as quantityOrdered', 'p.image'])
            .filter({ 'O.id': orderId })
            .getAll().then((orders) => {
                if (orders.length > 0) {
                    res.status(200).json(orders);
                } else {
                    res.json({ message: "No orders found with order id :" + orderId });
                }
            }).catch((err) => console.log(err))


    })
    //PLACE A NEW ORDER

router.post('/new', (req, res) => {
    let { userId, products } = req.body;


    if (userId !== null && userId > 0 && !isNaN(userId)) {
        database.table('orders').insert({
            user_id: userId
        }).then(newOrderId => {

            if (newOrderId > 0) {
                products.forEach(async(p) => {
                    let data = await database.table('products').filter({ id: p.id }).withFields(['quantity']).get();
                    let incart = p.incart
                        //Deduct the number of pieces ordered from the quantity column in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - incart;
                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }
                    } else {
                        data.quantity = 0;
                    }
                    //Insert order details W.R.T with the new generated order id
                    database.table('orders_details').insert({
                        order_id: newOrderId,
                        product_id: p.id,
                        quantity: incart,

                    }).then(newId => {
                        database.table('products').filter({ id: p.id }).update({
                            quantity: data.quantity
                        }).then(success => {}).catch(err => console.log(err))
                    }).catch(err => console.log(err))
                });
            } else {
                res.json({ message: "new order faild while adding order details", success: false })
            }
            res.json({ message: "order success placed with order id :" + newOrderId, success: true, orderId: newOrderId, products: products })

        }).catch(err => console.log(err))
    } else {
        res.json({ message: 'new order failed', success: false })
    }
})

//FAKE PAYMENT GATEWAY CALL

router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({ success: true });
    }, 3000)
})





module.exports = router;