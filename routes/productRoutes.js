const express = require('express');
const router = express.Router();
const {addProduct, deleteProduct, fetchParticularPRoduct, getProductPresignedUrl} = require('../controllers/productController');

router.post('/add_product', addProduct);
router.post('/delete_product', deleteProduct);
router.post('/particular_product_detail', fetchParticularPRoduct);
router.post('/get_product_presigned_url', getProductPresignedUrl);

module.exports = router;