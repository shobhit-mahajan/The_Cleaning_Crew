import Booking from "../Model/Booking.models.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transpoter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.SMPT_HOST,
  auth: {
    user: process.env.SMPT_MAIL,
    pass: process.env.SMPT_APP_PASS,
  },
});
export const BookingAppoinment = async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      Email,
      Address,
      Date: bookingDate,
      ServicePlan,
    } = req.body;
    const prices = {
                              Basic:200,
                              Intermediate:400,
                              Pro:600

    }
    const Price = prices[ServicePlan]
    const existingBooking = await Booking.findOne({ Date: bookingDate });
    if (existingBooking) {
      return res.json({
        success: false,
        message: "Sorry the Date is Already Booked",
      });
    }
    const newBooking = await new Booking({
      Date: bookingDate,
      Address,
      Status: "Pending",
      ServicePlan,
      Price,
    });
    await newBooking.save();
    const mailOption = {
      from: process.env.SMPT_MAIL,
      to: Email,
      subject: "Approval Pending",
      subject: "Booking Confirmation",
      html: `<p>Your appointment has been booked for ${new Date(
        bookingDate
      ).toLocaleDateString()}.</p>
<p>Please wait for approval. We will notify you once the booking is confirmed.</p>`,
    };
    await transpoter.sendMail(mailOption);
    const adminMailOptions = {
      from: process.env.SMPT_MAIL,
      to: "mahajanshobhit38@gmail.com", // Replace with admin email
      subject: "New Booking Request",
      html: `<p>New booking request:</p>
                      <p>Customer: ${FirstName} ${LastName}</p>
                      <p>Email: ${Email}</p>
                      <p>Address: ${Address}</p>
                      <p>Date: ${new Date(bookingDate).toLocaleDateString()}</p>
                      <p>Status: Pending</p>,
                      <p>ServicePlan: ${ServicePlan}</p>,
                      <p>Price: ${Price}</p>`,
    };
    await transpoter.sendMail(adminMailOptions);
    res.json({ success: true, message: "Booking Created Successfully please wait for approval from team",booking:newBooking});
  } catch (error) {
    console.log(error);
  }
};

export const CheckBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, status: booking.Status });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to check booking status" });
  }
};
export const AllAppoinment = async(req,res)=>{
  try {
    const Appoinment = await Booking.find({})
    res.status(200).json({success:true,message:"All the booking Appoinment",Appoinment})
  } catch (error) {
    console.log(error)
  }
}

export const UpdateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { Status: status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking status updated successfully", updatedBooking });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to update booking status" });
  }
};

