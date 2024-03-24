const express = require('express');
const dbConnect = require('./config/dbConnect');

const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;

const authRouter = require('./routes/authRoutes');
const bodyParser = require('body-parser');

//connecting to Database
dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use('/api/user', authRouter)

app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})