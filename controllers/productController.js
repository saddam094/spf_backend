import cloudinary from './config/cloudinary.js';
import Product from '../models/Product.js';


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

/// Delete Product
const deleteProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    // 1️⃣ Check if product exists
    const product = await Product.findOne({ "_id": productId });
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        body: { message: "Product does not exist" },
      });
    }

    // 2️⃣ Delete all Cloudinary images
    // assuming product.images = ["https://res.cloudinary.com/.../abc123.jpg", "https://res.cloudinary.com/.../xyz456.png"]
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extract public_id from Cloudinary URL
          const parts = imageUrl.split("/");
          const filename = parts.pop(); // e.g. "abc123.jpg"
          const folder = parts.slice(parts.indexOf("upload") + 1).join("/");
          const publicId = folder.replace(/v\d+\//, "") + "/" + filename.split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error.message);
        }
      }
    }

    // 3️⃣ Delete product from MongoDB
    await Product.deleteOne({ "_id": productId });

    // 4️⃣ Send success response
    res.status(200).json({
      statusCode: 200,
      body: {
        message: "Product and all images deleted successfully",
        deletedProduct: product,
      },
    });

  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
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

const getProductPresignedUrl = async (req, res) => {
  try {
    const { fileName, folder = "products" } = req.body;
    if (!fileName) {
      return res.status(400).json({ statusCode: 400, message: "fileName is required" });
    }
    // Clean file name
    const cleanFileName = fileName.trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
    // Create unique key / public_id
    const timestamp = Math.floor(Date.now() / 1000);
    const key = `${folder}/${cleanFileName}_${timestamp}`;
    // Params to sign
    const paramsToSign = {
      timestamp,
      public_id: key,
      folder
    };
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    // Signed URL for direct upload (Cloudinary expects POST with multipart/form-data)
    const signedUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload?timestamp=${timestamp}&public_id=${encodeURIComponent(key)}&folder=${folder}&signature=${signature}&api_key=${process.env.CLOUDINARY_API_KEY}`;
    const uploadDetails = [
      {
        fileName,
        signedUrl,
        contentType: "image/jpeg"
      }
    ];
    res.status(200).json({
      statusCode: 200,
      body: { uploadDetails }
    });
  } catch (err) {
    console.error("Error generating Cloudinary presigned URL:", err);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

export { addProduct, deleteProduct, fetchParticularPRoduct, getProductPresignedUrl };