import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Header() {
  const navigate = useNavigate();
  const { logout,user,login } = useAuth();
  const [showPremiumMessage, setShowPremiumMessage] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleUpgrade = async () => {
    try {
      const response = await api.post("/payment/create-order");

      const order = response.data.order;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "LearnHub",
        description: "LearnHub Premium",
        order_id: order.id,

        handler: async function (paymentResponse) {
  try {
    const response = await api.post("/payment/verify", {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    });

    if (response.data.success) {
  const updatedUser = {
    ...user,
    is_premium: true,
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));
  login(updatedUser, localStorage.getItem("token"));

  setShowPremiumMessage(true);

setTimeout(() => {
  setShowPremiumMessage(false);
}, 5000);
}
  } catch (error) {
    console.error("Payment verification error:", error);

    alert("Payment verification failed.");
  }
},

        prefill: {
          name: "",
          email: "",
        },

        theme: {
          color: "#6366F1",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Unable to start payment. Please try again.");
    }
  };

  return (<>{showPremiumMessage && (
  <div className="fixed top-6 right-6 z-50 w-[350px] max-w-[90vw]">
    <div className="bg-white border border-green-200 shadow-2xl rounded-2xl p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
        🎉
      </div>

      <div>
        <h3 className="font-bold text-gray-900 text-base">
          Congratulations!
        </h3>

        <p className="text-sm text-gray-600 mt-1">
          Your LearnHub Premium membership is now active.
        </p>

        <p className="text-sm font-medium text-green-600 mt-1">
          Enjoy unlimited access!
        </p>
      </div>
    </div>
  </div>
)}
    <header className="bg-gradient-to-r from-[#111827] via-[#1f2933] to-[#111827] border-b border-white/20 shadow-md backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-3">

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src="/mylogo.png"
            alt="Learnhub Logo"
            className="h-14 sm:h-16 md:h-18 object-contain"
          />

          <h1 className="text-xl font-semibold text-white">
            Learnhub
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.is_premium ? (
  <span className="px-4 py-1 rounded bg-green-500 text-white text-sm font-medium">
    👑 Premium
  </span>
) : (
  <button
    onClick={handleUpgrade}
    className="px-4 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium"
  >
    ⭐ Upgrade to Premium
  </button>
)}

          <button
            onClick={handleLogout}
            className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            Logout
          </button>
        </div>

      </div>
    </header>
    </>
  );
}
