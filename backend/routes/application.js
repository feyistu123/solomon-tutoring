const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authenticateToken = require('../middleware/authMiddleware');

// @route   POST /api/applications
// @desc    Submit a new application (Public)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      parentName,
      email,
      phone,
      address,
      studentName,
      studentGrade,
      subjects,
      preferredDays,
      preferredTime,
      sessionFrequency,
      sessionDuration,
      budgetRange,
      expectedRate,
      additionalNotes,
      howDidYouHear,
      otherSource,
      message
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'parentName', 'email', 'phone', 'address',
      'studentName', 'studentGrade', 'subjects',
      'preferredDays', 'preferredTime', 'sessionFrequency'
    ];
    
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          message: `Please fill in all required fields. Missing: ${field}` 
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate budget range if provided
    const validBudgetRanges = [
      'Under 2,000 Birr/month',
      '2,000 - 3,000 Birr/month',
      '3,000 - 5,000 Birr/month',
      '5,000 - 7,000 Birr/month',
      '7,000 - 10,000 Birr/month',
      'Above 10,000 Birr/month',
      'Prefer not to say'
    ];
    
    if (budgetRange && !validBudgetRanges.includes(budgetRange)) {
      return res.status(400).json({ 
        message: 'Invalid budget range selected' 
      });
    }

    // Create new application
    const application = new Application({
      parentName,
      email,
      phone,
      address,
      studentName,
      studentGrade,
      subjects,
      preferredDays,
      preferredTime,
      sessionFrequency,
      sessionDuration: sessionDuration || '1.5 hours',
      budgetRange: budgetRange || 'Prefer not to say',
      expectedRate: expectedRate || '',
      additionalNotes: additionalNotes || '',
      howDidYouHear: howDidYouHear || 'Other',
      otherSource: otherSource || '',
      message: message || '',
      status: 'Pending'
    });

    await application.save();

    // Send confirmation email (optional - implement later)
    // await sendConfirmationEmail(email, parentName);

    res.status(201).json({
      message: 'Application submitted successfully! Mr. Solomon will contact you within 24 hours.',
      application: {
        id: application._id,
        parentName: application.parentName,
        studentName: application.studentName,
        status: application.status,
        budgetRange: application.budgetRange,
        createdAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again or call Mr. Solomon directly.' 
    });
  }
});

// @route   GET /api/applications
// @desc    Get all applications with optional filters (Private)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, budgetRange, grade, sort } = req.query;
    
    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (budgetRange) filter.budgetRange = budgetRange;
    if (grade) filter.studentGrade = grade;
    
    // Build sort object
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === 'budget-high') sortOptions = { budgetRange: -1 };
    else if (sort === 'budget-low') sortOptions = { budgetRange: 1 };
    else if (sort === 'grade') sortOptions = { studentGrade: 1 };
    
    const applications = await Application.find(filter)
      .sort(sortOptions);

    // Get summary statistics
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'Pending').length,
      contacted: applications.filter(a => a.status === 'Contacted').length,
      negotiating: applications.filter(a => a.status === 'Negotiating').length,
      enrolled: applications.filter(a => a.status === 'Enrolled').length,
      budgetAnalysis: {
        under2000: applications.filter(a => a.budgetRange === 'Under 2,000 Birr/month').length,
        under3000: applications.filter(a => a.budgetRange === '2,000 - 3,000 Birr/month').length,
        under5000: applications.filter(a => a.budgetRange === '3,000 - 5,000 Birr/month').length,
        under7000: applications.filter(a => a.budgetRange === '5,000 - 7,000 Birr/month').length,
        under10000: applications.filter(a => a.budgetRange === '7,000 - 10,000 Birr/month').length,
        above10000: applications.filter(a => a.budgetRange === 'Above 10,000 Birr/month').length,
        preferNotSay: applications.filter(a => a.budgetRange === 'Prefer not to say').length
      }
    };

    res.json({
      stats,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get a single application by ID (Private)
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    // Calculate estimated price based on grade and frequency
    const estimatedPrice = calculateEstimatedPrice(
      application.studentGrade,
      application.sessionFrequency,
      application.sessionDuration
    );

    res.json({
      ...application.toObject(),
      estimatedPrice
    });

  } catch (error) {
    console.error('Get application error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update an application (Private)
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      parentName,
      email,
      phone,
      address,
      studentName,
      studentGrade,
      subjects,
      preferredDays,
      preferredTime,
      sessionFrequency,
      sessionDuration,
      budgetRange,
      expectedRate,
      additionalNotes,
      howDidYouHear,
      otherSource,
      message,
      status,
      estimatedPrice,
      notes,
      followUpDate
    } = req.body;

    // Find application and update
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    // Update fields (only if provided)
    application.parentName = parentName || application.parentName;
    application.email = email || application.email;
    application.phone = phone || application.phone;
    application.address = address || application.address;
    application.studentName = studentName || application.studentName;
    application.studentGrade = studentGrade || application.studentGrade;
    application.subjects = subjects || application.subjects;
    application.preferredDays = preferredDays || application.preferredDays;
    application.preferredTime = preferredTime || application.preferredTime;
    application.sessionFrequency = sessionFrequency || application.sessionFrequency;
    application.sessionDuration = sessionDuration || application.sessionDuration;
    application.budgetRange = budgetRange || application.budgetRange;
    application.expectedRate = expectedRate || application.expectedRate;
    application.additionalNotes = additionalNotes || application.additionalNotes;
    application.howDidYouHear = howDidYouHear || application.howDidYouHear;
    application.otherSource = otherSource || application.otherSource;
    application.message = message || application.message;
    application.status = status || application.status;
    application.estimatedPrice = estimatedPrice || application.estimatedPrice;
    application.notes = notes || application.notes;
    application.followUpDate = followUpDate || application.followUpDate;
    application.updatedAt = Date.now();

    await application.save();

    res.json({
      message: 'Application updated successfully',
      application
    });

  } catch (error) {
    console.error('Update application error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   PATCH /api/applications/:id/status
// @desc    Update only the status of an application (Private)
// @access  Private
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, followUpDate, notes } = req.body;

    if (!status) {
      return res.status(400).json({ 
        message: 'Please provide a status' 
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    application.status = status;
    if (followUpDate) application.followUpDate = followUpDate;
    if (notes) application.notes = notes;
    application.updatedAt = Date.now();
    await application.save();

    res.json({
      message: 'Status updated successfully',
      application: {
        id: application._id,
        status: application.status,
        followUpDate: application.followUpDate,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Update status error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete an application (Private)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    await application.deleteOne();

    res.json({ 
      message: 'Application deleted successfully' 
    });

  } catch (error) {
    console.error('Delete application error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

// Helper function to calculate estimated price
function calculateEstimatedPrice(grade, frequency, duration) {
  // Base rates based on grade level
  const gradeRates = {
    'Nursery': 150,
    'KG': 180,
    'Grade 1': 200,
    'Grade 2': 220,
    'Grade 3': 250,
    'Grade 4': 280,
    'Grade 5': 300,
    'Grade 6': 350,
    'Grade 7': 400,
    'Grade 8': 450
  };

  // Frequency multipliers (per month)
  const frequencyMultipliers = {
    '1 day/week': 4,
    '2 days/week': 8,
    '3 days/week': 12,
    '4 days/week': 16,
    '5 days/week': 20,
    'Weekends only': 8,
    'Flexible': 12
  };

  // Duration multipliers
  const durationMultipliers = {
    '1 hour': 1,
    '1.5 hours': 1.5,
    '2 hours': 2,
    'Flexible': 1.5
  };

  const baseRate = gradeRates[grade] || 250;
  const frequencyMultiplier = frequencyMultipliers[frequency] || 12;
  const durationMultiplier = durationMultipliers[duration] || 1.5;

  // Calculate estimated monthly price
  const estimatedMonthly = Math.round(baseRate * frequencyMultiplier * durationMultiplier * 1.2); // 20% buffer for travel

  return {
    baseRate: baseRate,
    estimatedMonthly: estimatedMonthly,
    estimatedRange: `${Math.round(estimatedMonthly * 0.85)} - ${Math.round(estimatedMonthly * 1.15)} Birr/month`,
    recommendation: estimatedMonthly > 5000 ? 
      'Premium pricing recommended' : 
      estimatedMonthly > 3000 ? 
      'Standard pricing' : 
      'Competitive pricing'
  };
}

module.exports = router;