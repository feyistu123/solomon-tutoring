const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // Personal Information
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Student Information
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentGrade: {
    type: String,
    required: true,
    enum: ['Nursery', 'KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']
  },
  subjects: {
    type: String,
    required: true,
    trim: true
  },
  
  // Scheduling Information
  preferredDays: {
    type: String,
    required: true,
    trim: true
  },
  preferredTime: {
    type: String,
    required: true,
    trim: true
  },
  sessionFrequency: {
    type: String,
    enum: ['1 day/week', '2 days/week', '3 days/week', '4 days/week', '5 days/week', 'Weekends only', 'Flexible'],
    required: true
  },
  sessionDuration: {
    type: String,
    enum: ['1 hour', '1.5 hours', '2 hours', 'Flexible'],
    default: '1.5 hours'
  },
  
  // Pricing/Negotiation Fields
  budgetRange: {
    type: String,
    enum: [
      'Under 2,000 Birr/month',
      '2,000 - 3,000 Birr/month',
      '3,000 - 5,000 Birr/month',
      '5,000 - 7,000 Birr/month',
      '7,000 - 10,000 Birr/month',
      'Above 10,000 Birr/month',
      'Prefer not to say'
    ],
    default: 'Prefer not to say'
  },
  expectedRate: {
    type: String,
    trim: true,
    default: ''
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  
  // Additional Fields
  howDidYouHear: {
    type: String,
    enum: [
      'Friend/Family',
      'Social Media',
      'Google Search',
      'School Recommendation',
      'Flyer/Poster',
      'Other'
    ],
    default: 'Other'
  },
  otherSource: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  
  // Admin Fields
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Negotiating', 'Enrolled', 'Not Interested', 'Follow-up Needed'],
    default: 'Pending'
  },
  estimatedPrice: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);