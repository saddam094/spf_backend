const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// 1️⃣ Create Express app
const app = express();

// 2️⃣ Middleware
app.use(cors());
app.use(bodyParser.json());

// 3️⃣ Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// 4️⃣ Use Routes
app.use('/api/auth', authRoutes);
app.use('/product', productRoutes);

// 5️⃣ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// 6️⃣ Root route
app.get('/', (req, res) => {
    res.send('Shop API is running');
});

// 7️⃣ Listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));