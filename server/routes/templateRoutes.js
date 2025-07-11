const express = require('express');
const router = express.Router();
const EstimateTemplate = require('../models/estimateTemplates'); 

// GET all estimate templates (can be filtered by active status for public view)
// For admin, we might want to see all, including inactive ones
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query; // Query param to include inactive templates
    let query = {};
    if (includeInactive !== 'true') {
      query.isActive = true; // By default, only fetch active templates
    }

    const templates = await EstimateTemplate.find(query).sort({ plan: 1, name: 1 });
    res.status(200).json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching estimate templates:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// GET a single estimate template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await EstimateTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(200).json({ success: true, template });
  } catch (error) {
    console.error('Error fetching single estimate template:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// POST create a new estimate template
router.post('/', async (req, res) => {
  try {
    const { id, name, plan, description, image, isActive } = req.body;

    // Basic validation
    if (!id || !name || !plan || !image) {
      return res.status(400).json({ success: false, message: 'Missing required fields: id, name, plan, image' });
    }

    // Check if ID already exists
    const existingTemplate = await EstimateTemplate.findOne({ id });
    if (existingTemplate) {
      return res.status(409).json({ success: false, message: 'Template with this ID already exists. Please choose a unique ID.' });
    }

    const newTemplate = new EstimateTemplate({
      id,
      name,
      plan,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    });

    const savedTemplate = await newTemplate.save();
    res.status(201).json({ success: true, message: 'Template created successfully', template: savedTemplate });
  } catch (error) {
    console.error('Error creating estimate template:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// PUT update an existing estimate template by ID (MongoDB _id)
router.put('/:id', async (req, res) => {
  try {
    const { name, plan, description, image, isActive } = req.body; // 'id' from params, not body

    const updatedTemplate = await EstimateTemplate.findByIdAndUpdate(
      req.params.id,
      { name, plan, description, image, isActive },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedTemplate) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({ success: true, message: 'Template updated successfully', template: updatedTemplate });
  } catch (error) {
    console.error('Error updating estimate template:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// DELETE an estimate template by ID (MongoDB _id)
router.delete('/:id', async (req, res) => {
  try {
    const deletedTemplate = await EstimateTemplate.findByIdAndDelete(req.params.id);

    if (!deletedTemplate) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting estimate template:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;
