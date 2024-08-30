import express from "express";
const router = express.Router();
import Booking from "../models/Bookingmodels.js";

const BookingDetail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking details.",
    });
  }
};

