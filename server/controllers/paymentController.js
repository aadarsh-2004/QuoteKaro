// const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
// const crypto = require('crypto');
// const Transaction = require('../models/payments');
// const User = require('../models/user');

// exports.createOrder = async (req, res) => {
//   try {
//     const { amount, userId, purpose } = req.body; // amount in rupees

//     const options = {
//       amount: amount * 1, // convert to paise
//       currency: "INR",
//       receipt: `rcpt_${Date.now()}`,
//       notes: {
//         userId,
//         purpose, // "plan" or "topup"
//       },
//     };

//     const order = await razorpay.orders.create(options);

//     res.json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating Razorpay order", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   const {
//     razorpay_payment_id,
//     razorpay_order_id,
//     razorpay_signature,
//     userId,
//     type,
//     purchasedAmount ,
//     credits,
//     planName,
//     billingCycle,
//   } = req.body;

//   const amount = purchasedAmount;
//   try {

//     // (Optional) Verify signature for security
//     const generated_signature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest('hex');

//     if (generated_signature !== razorpay_signature)
//       return res.status(400).json({ success: false, message: "Invalid signature" });

//     // Save Payment
//     await Transaction.create({
//       userId,
//       paymentGateway: 'razorpay',
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       amount,
//       currency: 'INR',
//       status: 'success',
//       creditsPurchased: credits,
//       type,
//     });

//     // Update User
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false });

//     if (type === "subscription") {
//       user.plan = planName;
//       user.billingCycle = billingCycle;

//       const expiry = new Date();
//       expiry.setMonth(expiry.getMonth() + (billingCycle === "yearly" ? 12 : 1));
//       user.planExpiresAt = expiry;

//       user.total_credits = credits;
//       user.left_credits =  credits || 0 ;
//       user.left_credits =  credits || 0 ;
//       user.used_credits = 0 ;

//     } else {
//       user.left_credits += credits;
//       user.total_credits += credits;
//     }

//     await user.save();

//     res.status(200).json({ success: true });
//   } catch (err) {
//     console.error("Payment verification failed", err);
//     res.status(500).json({ success: false });
//   }
// };

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const crypto = require("crypto");
const Transaction = require("../models/payments");
const User = require("../models/user");

exports.createOrder = async (req, res) => {
  try {
    const { amount, userId, purpose } = req.body; // amount in rupees

    const options = {
      amount: amount * 1, // <<-- Changed to 100 for paise, important!
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId,
        purpose, // "plan" or "topup"
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    userId,
    type,
    purchasedAmount,
    credits, // Assuming this is ALWAYS the monthly credit amount for subscriptions
    planName,
    billingCycle,
  } = req.body;

  const amount = purchasedAmount;
  try {
    // (Optional) Verify signature for security
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    let actualCreditsToGrant = credits; // Start with the credits value from req.body

    // --- Only change needed here for subscriptions ---
    if (type === "subscription" && billingCycle === "yearly") {
      actualCreditsToGrant = credits * 12; // Multiply by 12 if yearly
    } // Save Payment
    // If it's a monthly subscription, actualCreditsToGrant remains `credits`
    // If it's a topup, actualCreditsToGrant remains `credits`

    await Transaction.create({
      userId,
      paymentGateway: "razorpay",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount,
      currency: "INR",
      status: "success",
      creditsPurchased: actualCreditsToGrant, // Use the adjusted credits
      type,
    }); // Update User

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (type === "subscription") {
      user.plan = planName;
      user.billingCycle = billingCycle;

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (billingCycle === "yearly" ? 12 : 1));
      user.planExpiresAt = expiry;

      user.total_credits = actualCreditsToGrant; // Use the adjusted credits
      user.left_credits = actualCreditsToGrant;
      user.used_credits = 0; // Reset used credits for a fresh subscription
    } else {
      // This handles "topup" payments
      user.left_credits += actualCreditsToGrant; // Add credits for top-ups
      user.total_credits += actualCreditsToGrant;
    }

    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Payment verified and user updated successfully",
      });
  } catch (err) {
    console.error("Payment verification failed", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during payment verification",
      });
  }
};
