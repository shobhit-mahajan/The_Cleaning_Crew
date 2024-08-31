import dotenv from "dotenv";
import Stripe from 'stripe';
import Booking from '../Model/Booking.models.js';
import nodemailer from 'nodemailer';
import userDetail from '../Model/Booking.models.js'

// Load environment variables from .env file
dotenv.config();

// Initialize Stripe with the secret key from the environment
const stripe = new Stripe("sk_test_51PsEseGQe9fJ5R2jfe9MtW3RJsBxiqA8wdunb2rm0IARUbpuMOxcq4O1In4OiAhq80WmBHSw0sFfFXiDeNwftWZK00UCiYFKHy");

// Configure Nodemailer transporter with Gmail settings
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "mahajanshobhit38@gmail.com",
    pass: "qlgr gjpl xwbn locb",
  },
});

// Function to process payment and send confirmation email
export const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);


    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.Status !== "Approved") {
      return res.status(400).json({ success: false, message: "Payment not allowed before approval" });
    }
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Service Plan: ${booking.ServicePlan}`,
          },
          unit_amount: booking.Price * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url:`${process.env.CLIENT_URL}/paymentSuccess`,
      cancel_url: `${process.env.CLIENT_URL}/paymentcancel`
    });

    // Send session ID to client
    res.json({ success: true, id: session.id });

  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// Function to send payment confirmation email
const sendPaymentConfirmation = async (booking) => {
  console.log(booking)
  try {
    console.log('Preparing to send payment confirmation email...');
    const userMailOptions = {
      from:"mahajanshobhit38@gmail.com",
      to: booking.Email,
      subject: "Payment Confirmation",
      html: `<p>Your payment of Rs${booking.Price} for the ${booking.ServicePlan} plan has been successfully processed.</p>
             <p>Thank you for choosing our service.</p>`,
    };
    await transporter.sendMail(userMailOptions);
    console.log('Payment confirmation email sent.');
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
