import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
   userId:{type:String},
   otp:{type:String},
   createdAt:{type:Date},
   expireAt:{type:Date}
});

const Otps = mongoose.model("Otps", otpSchema);
export default Otps;