const Product = require('../models/Product');


/// Add Product
const addProduct = async (req, res) => {
    const {vendorId, name, description, price, stock, category, images} = req.body;

    try {
        // Check ---> Product exist or not
        const isProductExisting = await Product.findOne({name, vendorId});
        if(isProductExisting)
            res.status(500).json({statusCode: 500,body: {message: "Product Already Exist"}});

        // Generate Custom Product ID
        const now = new Date();
        const productId = 'prod'+now.getFullYear().toString()+String(now.getMonth() + 1).padStart(2, '0')+String(now.getDate()).padStart(2, '0')+String(now.getHours()).padStart(2, '0')+String(now.getMinutes()).padStart(2, '0')+String(now.getSeconds()).padStart(2, '0')+Math.floor(Math.random() * 900 + 100);

        const newProduct = new Product({
            _id: productId,
            vendorId,
            name,
            description,
            price,
            stock,
            category,
            images
        });

        await newProduct.save();
        res.status(200).json(
            {
                statusCode: 200,
                body: {
                    message: "Product Added Successfully",
                    product: newProduct
                }
            }
        );

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


/// Fetch Particular Product
const fetchParticularPRoduct = async (req, res) => {
    const {productId} = req.body;

    try {
        
        /// Check Product Exist Or Not
        const isProductExist = await Product.findOne({_id: productId});
        if(isProductExist){
            res.status(200).json(
                {
                    statusCode: 200,
                    body: isProductExist
                }
            );
        } else {
            res.status(400).json(
                {
                    statusCode: 400,
                    body: {
                        message: "Product Does Not Exist"
                    }
                }
            );
        }

    } catch (err) {
        res.status(500).json({ body: {message: err.message }});
    }
};

module.exports = { addProduct, fetchParticularPRoduct };