const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  photos: [String],

  location: {
    lat: Number,
    lng: Number,
    address: String,
    landmark: String
  },

  category: String,

  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Low'
  },

  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },

  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  anonymous: {
    type: Boolean,
    default: false
  },

  supportCount: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  ward: String,
  assignee: String
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
