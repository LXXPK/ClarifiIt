// controllers/updateMood.js

const UserModel = require('../models/UserModel');

const updateMood = async (req, res) => {
    const { userId, mood, moodColor } = req.body;

    try {
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { mood, moodColor },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = updateMood;
