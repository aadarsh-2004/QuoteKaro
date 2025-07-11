const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    firebaseUID: { type: String, required: true, unique: true },

    studioName: { type: String, required: true },
    caption: { type: String },
    logoUrl: { type: String }, //  Cloudinary URL
    website: { type: String },

    phone2: { type: String }, // optional
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      youtube: { type: String },
    },

    // Address
    address: {
      d_address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },

    policies: { type: String },
    notes: { type: String },

    // SaaS Related
    plan: { type: String, default: "Starter" },
    
    total_estimates: { type: Number, default: 0 },
    total_clients: { type: Number, default: 0 },

    total_credits: { type: Number, default: 10 },
    left_credits: { type: Number, default: 0 },
    used_credits: { type: Number, default: 0 },

    totalturnover: { type: Number, default: 0 },

    isSuspended: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now },

    planExpiresAt: {
      type: Date,
      default: null,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    services: [
      {
        servideid:{ type: String},
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    selectedEstimateTheme: { type: String, default: "simple" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
