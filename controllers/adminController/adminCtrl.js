const jwt = require('jsonwebtoken');
const fs = require('fs');
const { google } = require('googleapis');
// const { authenticate } = require('@google-cloud/local-auth');
const cloudinary = require('cloudinary').v2;


const Admin = require('../../models/adminModel/adminModel');
const Video = require('../../models/adminModel/video.adminModel');
// const { authUrl, oauth2Client } = require('../../config/adminConfig/Oauth2');

// -------------- login -----------------
exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'username, email and passowrd are required',
            });
        };
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be strong (include upper, lower, number, and special character)',
            });
        };
        const existsAdmin = await Admin.countDocuments();

        if (existsAdmin === 1) {
            return res.status(200).json({
                success: false,
                message: "Admin already created, you can't make admin.",
            });
        } else {
            const newAdmin = new Admin(req.body);
            await newAdmin.save();
            console.log('Admin user created successfully');
        };

        res.status(201).json({
            success: true,
            message: "Admin user created successfully...",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    };
};

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        };
        const admin = await Admin.findOne({ email });

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email and password',
            });
        };
        const token = jwt.sign({
            email: admin.email,
            role: admin.role
        }, process.env.ADMIN_SECRET_KEY, { expiresIn: '6h' });

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            maxAge: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
        });

        res.status(200).json({
            success: true,
            message: 'Admin logged in successful...',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error occured while login the admin',
        });
    };
};

// ------------- upload video -----------------

exports.uploadDummyVideo = async (req, res) => {
    try {
        if(req.body.length == 0){
            return res.status(400).json({
                success: false,
                message: "No data"
            });
        };
        await Video.insertMany(req.body);
        res.status(201).json({
            success: true,
            message: "videos uploaded successfully...",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "error occured while inserting the video"
        });
    };
};

exports.uploadVideoToYoutube = async (req, res) => {
    const { title, description, category, thumbnail, video_url } = req.body;
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files were uploaded.',
            });
        };
        console.log(req.files);

        const auth = new google.auth.GoogleAuth({
            keyFile: './config/adminConfig/oauth2.json',
            scopes: ['https://www.googleapis.com/auth/youtube.upload'],
        });
        const Auth = await auth.getClient();

        const youtube = google.youtube({ version: 'v3', auth: Auth });
        const fileSize = req.files.size;
        const videoFile = req.files.video;

        const response = await youtube.videos.insert({
            part: 'snippet,status',
            notifySubscribers: false,
            requestBody: {
                snippet: {
                    title: title || 'Untitled Video',
                    description: description || '',
                },
                status: {
                    privacyStatus: 'unlisted',
                },
            },
            media: {
                body: fs.createReadStream(videoFile.tempFilePath),
            },
        }, {
            onUploadProgress: (evt) => {
                const progress = (evt.bytesRead / fileSize) * 100;
                console.log(`${Math.round(progress)}% complete`);
            },
        });
        console.log('Video uploaded successfully:', response.data);
        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully...',
            videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'error occured while uploading the video',
        });
    };
};

exports.uploadVideoToCloudinary = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files were uploaded.',
            });
        };
        const tempFilePath = req.files.video.tempFilePath;
        const result = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: 'video',
        });
        console.log('Upload successful:', result);

        res.status(200).json({
            success: false,
            message: 'Video uploaded successfully...',
            url: result.secure_url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'error occured while uploading the video',
        });
    };
};

exports.getAllvideos = async (req, res) => {
    try {
        const videos = await Video.find({}, { __v: 0 });
        res.status(200).json({
            success: true,
            message: 'Video fetched successfully...',
            videos,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'error occured while fetching the video',
        });
    };
};

exports.getAllvideosByCategory = async (req, res) => {
    try {
        const category = req.body.category || req.query.category;
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'category is required',
            });
        };
        const videosByCategory = await Video.find({ category }, { __v: 0 });
        if (videosByCategory.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Videos Not Found',
            });
        };
        res.status(200).json({
            success: false,
            message: 'Videos fetched successfully...',
            videosByCategory,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'error occured while fetching the video',
        });
    };
};
