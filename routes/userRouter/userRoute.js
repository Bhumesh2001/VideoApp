const express = require('express');
const userRouter = express.Router();

// controllers
const userController = require('../../controllers/userController/userCtrl');
const videoUserController = require('../../controllers/userController/video.userCtrl');
const paymentUserController = require('../../controllers/userController/payment.userCtrl');

// middlewares
const { isSubscriptionValid } = require('../../middlewares/userMiddleware/payment.userMidlwr');
const { userAuthentication } = require('../../middlewares/userMiddleware/userMidlwr')

// ********************* login/signup routes *********************

// register user 
userRouter.post('/register', userController.registerUser);

// verify user 
userRouter.post('/verify-user', userController.verifyUser);

// login user 
userRouter.post('/login', userController.loginUser);

// logout user 
userRouter.post('/logout', userController.logoutUser);

// login with google  
userRouter.get('/auth/google', userController.redirectToGoogleProfile);
userRouter.get('/auth/google/callback', userController.getGoogleProfile);

// login with facebook -
userRouter.get('/auth/facebook', userController.redirectToFacebookProfile);
userRouter.get('/auth/facebook/callback', userController.getFacebookProfile);

// ******************** Category routes **********************

// fetch all videos
userRouter.get('/fetch/all/videos', userAuthentication, videoUserController.getAllVideos);

// fetch all videos by category 
userRouter.get(
    '/fetch/all/videos/by-category',
    userAuthentication,
    videoUserController.getAllVideosByCategory
);

// ******************** Payments routes **********************

// create payment
userRouter.post(
    '/create-payment',
    userAuthentication,
    isSubscriptionValid,
    paymentUserController.CreatePayment
);

module.exports = userRouter;