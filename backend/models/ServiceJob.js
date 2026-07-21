const mongoose = require('mongoose');

const ServiceJobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleType: { type: String, enum: ['bike', 'car'], required: true },
    bikeModel: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    serviceType: { type: String, required: true },
    partsToReplace: [{ type: String }],
    estimatedCost: { type: Number },
    // estimatedCost: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['Pending', 'To Do', 'In Progress', 'In Review', 'Done'], 
        default: 'Pending' 
    },
    adminNotes: { type: String, default: '' },
    invoice: { type: Object, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ServiceJob', ServiceJobSchema);