const express = require('express');
const adminRouter = express();

const adminController = require('../../controllers/adminController/adminCtrl');
const { adminAuth, loginRateLimiter } = require('../../middlewares/adminMiddleware/auth.adminMdlwr');

adminRouter.post('/create-admin', adminController.createAdmin);
adminRouter.post('/login-admin', loginRateLimiter, adminController.loginAdmin);

adminRouter.post(
    '/upload-video',
    adminAuth,
    adminController.uploadVideoToCloudinary
);

adminRouter.post('/upload-dummy-video',adminController.uploadDummyVideo);
adminRouter.get('/get-all-videos', adminAuth, adminController.getAllvideos);
adminRouter.get('/get-all-videos-by-category', adminAuth, adminController.getAllvideosByCategory);

module.exports = adminRouter;
