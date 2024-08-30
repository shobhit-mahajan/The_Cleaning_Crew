import { Stripe } from "stripe";
import dotenv from "dotenv";
import Booking from "../Model/Booking.models.js";
import express from "express";
import nodemailer from "nodemailer";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transpoter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.SMPT_HOST,
  auth: {
    user: process.env.SMPT_MAIL,
    pass: process.env.SMPT_APP_PASS,
  },
});

export const checkOut = async (req, res) => {
  const { BookingId, Plan } = req.body;
  try {
    const booking = await Booking.findOne({ BookingId });
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    let Price;
    if (Plan === "Basic") {
      Price = 200;
    } else if (Plan === "Intermediate") {
      Price = 400; // Price in cents
    } else if (Plan === "Pro") {
      Price = 600; // Price in cents
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan selected" });
    }
    const session = stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency:"usd",
            product_data:{
               name : `${Plan} Plan`
            },
            unit_amount:Price,
          },
          quantity:1
        },
      ],
      mode:'payment',
      success_url:`${process.env.CLIENT_URL}/paymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/paymentcancel`,
    });
    res.status(200).json({success:true,sessionId:session.id})
  } catch (error) {
    console.log(error);
  }
};

export const PaymentSuccess = async(req,res)=>{
               const {session_id} = req.query 
               try {
                              const session = await stripe.checkout.sessions.retrieve(session_id)
                              const booking = await Booking.findOneAndUpdate(
                                             { _id: session.client_reference_id },
                                             { PaymentStatus: "Paid" },
                                           );
                                           if (!booking) {
                                             return res.status(404).json({ success: false, message: "Booking not found" });
                                           }
                                           const mailOptions = {
                                             from: process.env.SMPT_MAIL,
                                             to: booking.email,
                                             subject: "Invoice for Your Booking",
                                             html: `<p>Dear ${booking.FirstName},</p>
                                                    <p>Thank you for your payment. Attached is your invoice for the ${session.amount_total / 100} USD.</p>`,
                                           };
                                           await transpoter.sendMail(mailOptions);
                                           res.status(200).json({ success: true, message: "Payment successful, invoice sent" });

               } catch (error) {
                             console.log(error) 
               }
}
