const express = require('express');
const dbConnect = require('./config/dbConnect');

const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;

const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoute')
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');

//connecting to Database
dbConnect();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())


//calling an api using authRouter for a new user
app.use('/api/user', authRouter)
//calling an api for using productRouter for CRUD of products
app.use('/api/product',productRouter)


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})