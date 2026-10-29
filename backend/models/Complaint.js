const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  photos: [String], // path or URL
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  category: String,
  severity: { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Low' },
  status: { type: String, enum: ['Pending','In Progress','Resolved','Closed'], default: 'Pending' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supportCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  ward: String,
  assignee: String // contractor/team name
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
