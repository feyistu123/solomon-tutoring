const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  studentName: { type: String, required: true },
  studentGrade: { type: String, required: true },
  address: { type: String, required: true },
  preferredDays: { type: String },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Contacted', 'Enrolled', 'Not Interested'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema);