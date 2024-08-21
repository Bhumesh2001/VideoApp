const videoModel = require('../../models/adminModel/video.adminModel');

exports.getAllVideos = async(req, res) => {
    try {
        const videos = await videoModel.find({});
        res.status(200).json({
            success: true,
            message: 'All videos fetched successfully...',
            videos,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error occured while fetching the videos',
        });
    };
};

exports.getAllVideosByCategory = async (req, res) => {
    try {
        const { category } = req.body || req.query; 
        if(!category){
            return res.status(400).json({
                success: false,
                messagge: 'category is required',
            });  
        };
        const videosByCategory = await videoModel.find({ category });
        res.status(200).json({
            success: true,
            message: "Video fetched By category successfully...",
            videosByCategory,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error occured while fetching the videos by category',
        });   
    };
};
