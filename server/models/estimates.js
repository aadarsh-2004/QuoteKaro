const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  clientName: { type: String, required: true },
  functionName: { type: String },        
  location: { type: String },
  phoneNumber: { type: String },
  description: { type: String },
  notes: { type: String },

  // Event Duration
  startDate: { type: Date },
  endDate: { type: Date },

  
  services: [
    {
      serviceName: { type: String, required: true },
      description: { type: String },
      quantity: { type: Number, default: 1 },
      pricePerUnit: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    }
  ],

  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'amount'], default: 'amount' },
  netTotal: { type: Number, default: 1 },

  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted'],
    default: 'draft',
  },
  
  pdfUrl: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Estimate', estimateSchema);
