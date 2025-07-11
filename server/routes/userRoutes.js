const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

// GET all users
// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET a single user by ID
// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching single user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create a new user
// POST /api/users
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // Respond with the created user
  } catch (error) {
    console.error('Error creating user:', error);
    // Handle validation errors or duplicate email/firebaseUID
    res.status(400).json({ message: 'Failed to create user', error: error.message });
  }
});

// PUT (full update) an existing user by ID
// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Failed to update user', error: error.message });
  }
});

// PATCH (partial update) user status (suspend/activate)
// PATCH /api/users/:id/status
// This endpoint specifically toggles isSuspended
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body; // Expecting { isSuspended: true/false }

    if (isSuspended === undefined || typeof isSuspended !== 'boolean') {
      return res.status(400).json({ message: 'Invalid status provided. Must be a boolean (isSuspended).' });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { isSuspended }, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(400).json({ message: 'Failed to update user status', error: error.message });
  }
});

// PATCH (partial update) for adding/subtracting credits
// PATCH /api/users/:id/credits
// This endpoint expects 'amount' to be added/subtracted
router.patch('/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const { addcredit } = req.body;

    if (addcredit === undefined || typeof addcredit !== 'number') {
      return res.status(400).json({ message: 'Invalid amount provided. Must be a number.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update left_credits and used_credits based on the amount
    user.total_credits = (user.total_credits || 0) + addcredit;
    user.left_credits = user.total_credits - (user.used_credits || 0);


    // Ensure credits don't go below zero if you have such a rule
    if (user.left_credits < 0) user.left_credits = 0;
    if (user.used_credits < 0) user.used_credits = 0;


    const updatedUser = await user.save(); // Save the updated user document

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user credits:', error);
    res.status(400).json({ message: 'Failed to update user credits', error: error.message });
  }
});


// DELETE a user by ID
// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', deletedUserId: id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { selectedEstimateTheme } = req.body; // Expecting this field from frontend

    // Validate that selectedEstimateTheme is provided
    if (!selectedEstimateTheme) {
      return res.status(400).json({ 
        success: false, 
        message: 'selectedEstimateTheme is required.' 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { selectedEstimateTheme: selectedEstimateTheme } }, // Fixed syntax: proper object format
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User preferences updated successfully.', 
      user: updatedUser 
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
});
module.exports = router;
