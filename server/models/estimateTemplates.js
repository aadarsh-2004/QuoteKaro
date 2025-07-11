const mongoose = require('mongoose');

const estimateTemplateSchema = new mongoose.Schema({
  id: { // A unique identifier for the template, can be a slug like "basic-minimal"
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  plan: { // Which plan is required to access this template
    type: String,
    enum: ['Starter','Basic', 'Professional', 'Enterprise'], // Adjust based on your plan names
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: { // URL to a preview image of the template
    type: String,
    required: true,
  },
  isActive: { // For enabling/disabling templates
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('EstimateTemplate', estimateTemplateSchema);
