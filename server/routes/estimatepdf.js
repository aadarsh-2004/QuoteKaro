const express = require("express");
const router = express.Router();
const Estimate = require("../models/estimates");
const User = require("../models/user");
const updateUserStats = require("../utils/calculateUserStats"); // Assuming this utility is still used elsewhere
const AWS = require('aws-sdk');
const dotenv = require('dotenv'); // Ensure dotenv is loaded if not in app.js

dotenv.config(); // Load environment variables

// Configure AWS SDK
// Ensure these environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME)
// are correctly set in your Vercel project settings and your local .env file.
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// ====================================================================================================
// NEW: Endpoint to GENERATE A PRESIGNED URL for direct S3 upload from the frontend
// This replaces the old /upload-pdf-s3 endpoint that received base64 data.
// ====================================================================================================
router.post('/generate-s3-presigned-url', async (req, res) => {
  const { fileName, contentType, firebaseUID } = req.body;

  if (!fileName || !contentType || !firebaseUID) {
    return res.status(400).json({ message: 'Missing required fields: fileName, contentType, or firebaseUID.' });
  }

  try {
    // Optional but recommended: Verify user exists for authorization
    // This prevents unauthorized users from generating presigned URLs
    const user = await User.findOne({ firebaseUID: firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found for upload authorization.' });
    }

    // Define S3 key (path in S3 bucket)
    // Organize files by user's MongoDB _id for better management and security
    // Using user._id is better than firebaseUID here if you manage users in MongoDB
    const s3Key = `estimates/${user._id}/${fileName}`;

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Expires: 60 * 5, // URL expires in 5 minutes (adjust as needed, e.g., 10 minutes)
      ContentType: contentType, // Important: Must match the Content-Type of the direct PUT request from frontend
      ACL: 'public-read' // Make the uploaded file publicly accessible
    };

    // Generate the presigned URL for a PUT operation
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);

    // Construct the public URL for the S3 object
    const publicUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    res.status(200).json({
      presignedUrl,
      publicUrl,
      s3Key // Optionally return s3Key if frontend needs to reference it later
    });

  } catch (error) {
    console.error('Error generating presigned URL for S3:', error);
    res.status(500).json({ message: 'Failed to generate S3 presigned URL.', error: error.message });
  }
});

// ====================================================================================================
// Existing: Endpoint to UPDATE the estimate record in MongoDB with the S3 PDF URL
// This endpoint remains the same as it receives the final URL, not the file data.
// ====================================================================================================
router.put('/:id/update-pdf-url', async (req, res) => {
  const { id } = req.params;
  const { pdfUrl, status, firebaseUID } = req.body;

  if (!pdfUrl || !status || !firebaseUID) {
    return res.status(400).json({ message: 'Missing required fields: pdfUrl, status, or firebaseUID.' });
  }

  try {
    const user = await User.findOne({ firebaseUID: firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User associated with provided firebaseUID not found.' });
    }

    const estimate = await Estimate.findOneAndUpdate(
      { _id: id, userId: user._id }, // Ensure the estimate belongs to the user
      { pdfUrl: pdfUrl, status: status, updatedAt: new Date() },
      { new: true } // Return the updated document
    );

    if (!estimate) {
      // If estimate is not found or userId doesn't match, it's unauthorized/not found
      return res.status(404).json({ message: 'Estimate not found or unauthorized to update.' });
    }

    // Optional: Update user stats after a successful estimate update (if applicable)
    // await updateUserStats(user._id); // Uncomment if you want to trigger this here

    res.status(200).json({ message: 'Estimate updated successfully with PDF URL and status.', estimate });

  } catch (error) {
    console.error('Error updating estimate with PDF URL:', error);
    res.status(500).json({ message: 'Internal server error while updating estimate.' });
  }
});


// ====================================================================================================
// REMOVED/DEPRECATED: The old /upload-pdf-s3 endpoint that received base64 data.
// You should remove or comment out your previous router.post('/upload-pdf-s3', ...) here.
// If you still have it, it will cause conflicts or allow the old, problematic upload method.
// Example of what to remove:
/*
router.post('/upload-pdf-s3', async (req, res) => {
  // ... old base64 upload logic ...
});
*/
// ====================================================================================================


module.exports = router;