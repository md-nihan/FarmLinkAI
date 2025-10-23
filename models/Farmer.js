const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  village: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  crops: {
    type: String,
    default: ''
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false  // Changed: Only active after approval
  },
  approvedBy: {
    type: String,
    default: ''
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  welcomeSent: {
    type: Boolean,
    default: false
  },
  // Track when welcome was successfully sent (for resiliency)
  welcomeSentAt: {
    type: Date
  },
  // Track which Twilio WhatsApp number (sandbox or BA) the farmer last interacted with
  lastWhatsappFrom: {
    type: String,
    default: ''
  },
  // Track which Twilio Account SID handled the farmer's inbound (to select correct account for outbound)
  lastTwilioAccountSid: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farmer', farmerSchema);
