const Video = require('../models/bhajanvideoModel');

exports.addVideo = async (req, res) => {
    try {
        const { bhajan_mandal_id, video_url, title, date } = req.body;

        if (!bhajan_mandal_id || !video_url || !title) {
            return res.status(400).json({ message: "Bhajan Mandal ID, video URL, and title are required", status: 0 });
        }

        const video = new Video({ bhajan_mandal_id, video_url, title, date });
        await video.save();

        res.status(201).json({ message: "Video added successfully", data: video, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.editVideo = async (req, res) => {
    try {
        const { video_id, video_url, title, date } = req.body;

        if (!video_id || !video_url || !title) {
            return res.status(400).json({ message: "Video ID, video URL, and title are required", status: 0 });
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            video_id, 
            { video_url, title, date }, 
            { new: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({ message: "Video not found", status: 0 });
        }

        res.status(200).json({ message: "Video updated successfully", data: updatedVideo, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const { video_id } = req.params;

        if (!video_id) {
            return res.status(400).json({ message: "Video ID is required", status: 0 });
        }

        const deletedVideo = await Video.findByIdAndDelete(video_id);
        if (!deletedVideo) {
            return res.status(404).json({ message: "Video not found", status: 0 });
        }

        res.status(200).json({ message: "Video deleted successfully", status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.getVideosByBhajanMandal = async (req, res) => {
    try {
        const { bhajan_mandal_id } = req.params;

        const videos = await Video.find({ bhajan_mandal_id });
        if (!videos.length) {
            return res.status(404).json({ message: "No videos found", status: 0 });
        }

        res.status(200).json({ message: "Videos fetched successfully", data: videos, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};



exports.getactiveVideosByBhajanMandal = async (req, res) => {
    try {
        const { bhajan_mandal_id } = req.params;

        const videos = await Video.find({ bhajan_mandal_id, status: 1 });
        if (!videos.length) {
            return res.status(404).json({ message: "No videos found", status: 0 });
        }

        res.status(200).json({ message: "Videos fetched successfully", data: videos, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
