const express = require('express');
const dbConnect = require('./config/dbConnect');

const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;

const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoute')
const blogRoutes = require('./routes/blogRoutes')
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

//connecting to Database
dbConnect();


app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())



//calling an api using authRouter for a new user
app.use('/api/user', authRouter)
//calling an api for using productRouter for CRUD of products
app.use('/api/product',productRouter)
//calling an api for CRUD on blog
app.use('/api/blogs',blogRoutes)

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})