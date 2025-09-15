const express = require('express');
const router = express.Router();
const {addProduct, fetchParticularPRoduct} = require('../controllers/productController');

router.post('/add_product', addProduct);
router.post('/particular_product_detail', fetchParticularPRoduct);

module.exports = router;