import News from '../models/News.js';

export const createNews = async (req, res) => {
    const { title, content, headerImageUrl } = req.body;

    try {
        const news = await News.create({
            title,
            content,
            author: req.user.id, 
            headerImageUrl
        });

        return res.status(201).json({ success: true, data: {newsId:news._id}, error:null });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
};

export const getNews = async (req, res) => {
    try {
        const news = await News.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("author", "fullName") 
            .select("-__v -updatedAt") 
            .lean();

        return res.status(200).json({ success: true, data: news, error:null });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: "Error fetching news" } });
    }
};

export const editNews = async (req, res) => {
    try {
        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select("-__v -updatedAt");

        if (!updatedNews) {
            return res.status(404).json({ success: false, error: { message: "News not found" } });
        }

        return res.status(200).json({ success: true, data: updatedNews, error:null });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
};

export const deleteNews = async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: { message: "News not found" } });
        }

        return res.status(200).json({ success: true, data:{ message: "News deleted successfully" } });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
};