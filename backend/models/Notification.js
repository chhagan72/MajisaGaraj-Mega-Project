const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: true }, // Can be an ObjectId string or literal key 'admin'
    title: { type: String, required: true },
    message: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceJob' },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);