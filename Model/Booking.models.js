import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  Address: { type: String, required: true },
 Status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending',
  },
  ServicePlan: { type: String, enum: ["Basic", "Intermediate", "Pro"], required: true },
  Price: { type: Number, required: true },
  PaymentStatus: {type:String,enum:['Paid','UnPaid'],default:'UnPaid'} ,
  
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
