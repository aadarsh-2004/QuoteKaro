const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors');
const { connect } = require('mongoose');
const connectionDB = require('./config/db')

// initialization
dotenv.config()
const app = express();

const allowedOrigins = ['https://www.quotekaro.in', 'http://localhost:5173' ,'https://quotekaro.in'];
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'firebaseUID'],
  credentials: true
};

app.use(cors(corsOptions));
// middleware
// app.use(cors({origin: '*'}));
app.use(express.json({ limit: '50mb' })); // IMPORTANT: Increase limit for large PDF base64 strings
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded bodies if needed


// connectionDB
connectionDB();

// RootRoute
const rootRoute = require("./routes/rootRoute");
app.use("/",rootRoute);

// RegisterUser
const registerUserRoute = require('./routes/registerUserRoute');
app.use('/api/user', registerUserRoute);

// checkUserProfile
const userProfileCompleteRoute = require('./routes/userProfileCompleteRoute');
app.use('/api/users',userProfileCompleteRoute)

const createProfileRoute = require('./routes/createProfileRoute');
app.use('/api/users', createProfileRoute); 




// Create New Estimate
const createestimateRoute = require('./routes/createEstimate');
app.use('/api/estimates', createestimateRoute);

// Edit Estimate
const editstimateRoute = require('./routes/editEstimate');
app.use('/estimate', editstimateRoute);

// delete Estimate
const deleteestimateRoute = require('./routes/deleteEstimate');
app.use('/estimate', deleteestimateRoute);

// pdf Estimate
const pdfestimateRoute = require('./routes/estimatepdf');
app.use('/api/estimates', pdfestimateRoute);

// Get All Estimate +  Get single Estimate by ID
const getEstimateRoute = require('./routes/getAllEstimates');
app.use('/api/estimates', getEstimateRoute);


// Plan Routes 
const planRoutes = require('./routes/planRoutes');
app.use('/api/plans', planRoutes);

// Use the user routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Transaction Route
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);


const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);


const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);


const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const emailTemplateRoutes = require('./routes/emailTemplateRoutes');
app.use('/api/email-templates', emailTemplateRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes); 

const logoUploadRoutes = require('./routes/logoUpload');
app.use('/api', logoUploadRoutes);

// For fetching estimate templates
const templateRoutes = require('./routes/templateRoutes'); 
app.use('/api/templates', templateRoutes);


const servicesRouter = require('./routes/services');
app.use('/api', servicesRouter);

app.listen(process.env.PORT ,  () =>{
    console.log(`server started on port  ${process.env.PORT}`);
    
});