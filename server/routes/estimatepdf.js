const express = require("express");
const router = express.Router();
const Estimate = require("../models/estimates");
const User = require("../models/user");
const updateUserStats = require("../utils/calculateUserStats");
const AWS = require('aws-sdk');

// Configure AWS SDK (ensure environment variables are set in .env)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});


const s3 = new AWS.S3();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// NEW: Endpoint to upload PDF to S3
router.post('/upload-pdf-s3', async (req, res) => {
  const { pdfBase64, fileName, firebaseUID } = req.body;

  if (!pdfBase64 || !fileName || !firebaseUID) {
    return res.status(400).json({ message: 'Missing required fields: pdfBase64, fileName, or firebaseUID.' });
  }

  try {
    // Optional: Verify user exists before upload (for security)
    const user = await User.findOne({ firebaseUID: firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found for upload authorization.' });
    }

    // Convert base64 to Buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Define S3 upload parameters
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `estimates/${user._id}/${fileName}`, // Organize by user ID for better management
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read' // Make the uploaded file publicly accessible
    };

    // Upload to S3
    const s3UploadResult = await s3.upload(params).promise();

    // Return the S3 public URL
    res.status(200).json({ pdfUrl: s3UploadResult.Location });

  } catch (error) {
    console.error('Error uploading PDF to S3:', error);
    res.status(500).json({ message: 'Failed to upload PDF to S3.', error: error.message });
  }
});

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
      { _id: id, userId: user._id },
      { pdfUrl: pdfUrl, status: status, updatedAt: new Date() },
      { new: true }
    );

    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found or unauthorized to update.' });
    }

    res.status(200).json({ message: 'Estimate updated successfully with PDF URL and status.', estimate });

  } catch (error) {
    console.error('Error updating estimate with PDF URL:', error);
    res.status(500).json({ message: 'Internal server error while updating estimate.' });
  }
});



module.exports = router;
