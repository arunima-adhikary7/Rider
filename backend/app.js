const dotenv=require('dotenv');
const cookieParser=require('cookie-parser');

dotenv.config();
const express=require('express');
const app=express();
const cors=require('cors');
const userRoutes=require('./routes/user.routes.js');
const captainRoutes=require('./routes/captain.routes.js');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users',userRoutes);
app.use('/captain',captainRoutes);

app.get('/',(req,res)=>{
    res.send('Hello World');
});

module.exports=app;