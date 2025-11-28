require('dotenv').config();

console.log("ACTIVE ADMIN SECRET =", process.env.ADMIN_SECRET);
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// ROUTE IMPORTS
const productsRoutes = require('./routes/products'); 
const authRoutes = require('./routes/auth');
const sellersRoutes = require('./routes/sellers');
const adminRoutes = require('./routes/admin');
const transactionsRoutes = require('./routes/transactions');
const historyRoutes = require('./routes/history');
const payoutsRoutes = require('./routes/payouts');
const bankRoutes = require('./routes/bankDetails');
const uploadRoutes = require('./routes/upload');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const suggestionsRoutes = require('./routes/suggestions');
const complaintsRoutes = require("./routes/complaints");
const settingsRoutes = require('./routes/settings');
const shippingRoutes = require('./routes/shipping');
const ridersRoutes = require('./routes/riders');


// CLEANUP JOB
const { startCleanup, cleanupTransactions } = require('./jobs/cleanupTransactions') || {};

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// start cleanup job (if exists)
try { typeof startCleanup === 'function' && startCleanup(); } catch(e){}
try { typeof cleanupTransactions === 'function' && setInterval(cleanupTransactions, 24*60*60*1000); } catch(e){}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// static uploads folder
app.use('/uploads', express.static('uploads'));


// --------------------------------------------------
// ✅ DEBUG LOGGING: Detect bad route export
// --------------------------------------------------
function logRoute(name, routeModule) {
  console.log(`🔍 Checking route: ${name} =>`, typeof routeModule);
}

logRoute("productsRoutes", productsRoutes);
logRoute("authRoutes", authRoutes);
logRoute("sellersRoutes", sellersRoutes);
logRoute("adminRoutes", adminRoutes);
logRoute("transactionsRoutes", transactionsRoutes);
logRoute("historyRoutes", historyRoutes);
logRoute("payoutsRoutes", payoutsRoutes);
logRoute("bankRoutes", bankRoutes);
logRoute("categoriesRoutes", categoriesRoutes);
logRoute("ordersRoutes", ordersRoutes);
logRoute("uploadRoutes", uploadRoutes);
logRoute("suggestionsRoutes", suggestionsRoutes);
logRoute("complaintsRoutes", complaintsRoutes);
logRoute("settingsRoutes", settingsRoutes);
// --------------------------------------------------


// --------------------------------------------------
// MOUNT ROUTES
// --------------------------------------------------
app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/payout-info', payoutsRoutes);
app.use('/api/bank-details', bankRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/shipping', shippingRoutes);
// in your server setup where you mount routes
app.use('/api/riders', require('./routes/riders'));


// health
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'Backend running' }));

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
