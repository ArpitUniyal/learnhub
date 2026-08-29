const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { User } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 49900, // ₹499 in rupees
      currency: "INR",
      receipt: `learnhub_${req.user.id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.is_premium = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      is_premium: true,
    });
  } catch (error) {
    console.error("RAZORPAY VERIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};