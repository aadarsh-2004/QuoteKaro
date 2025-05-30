const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors');
const { connect } = require('mongoose');
const connectionDB = require('./config/db')

// initialization
dotenv.config()
const app = express();

// middleware
app.use(cors({origin: '*'}));
app.use(express.json());

// connectionDB
connectionDB();

// RootRoute
const rootRoute = require("./routes/rootRoute");
app.use("/",rootRoute);

// RegisterUser
const registerUserRoute = require('./routes/registerUserRoute');
app.use('/api/user', registerUserRoute);

// checkUserProfile
const userProfileRoute = require('./routes/userProfileCheckRoute');
app.use('/api/users',userProfileRoute)

const createProfileRoute = require('./routes/createProfileRoute');
app.use('/api/users', createProfileRoute); 


app.listen(process.env.PORT ,  () =>{
    console.log(`server started on port  ${process.env.PORT}`);
    
});