require('dotenv').config();
require('./utils/userUtils/subscription.Util');
const express = require('express');
const cors = require('cors');
const cookiParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;
const { connectToDB } = require('./db/connect');

const adminRouter = require('./routes/adminRouter/adminRoute');
const userRouter = require('./routes/userRouter/userRoute');

const { adminAuth } = require('./middlewares/adminMiddleware/auth.adminMdlwr');

app.use(cors({
    origin: 'https://videoapp-api.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(cookiParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectToDB();

app.get('/', adminAuth, (req, res) => {
    res.redirect('https://web-digital-vle.netlify.app');
});

app.use('/admin', adminRouter);
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/\n`);
    console.log(`Go to this url for google login => http://localhost:${PORT}/user/auth/google`);
    console.log(`Go to this url for facebook login => http://localhost:${PORT}/user/auth/facebook\n`);
});