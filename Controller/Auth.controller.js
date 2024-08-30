import userDetail from "../Model/Auth.models.js";
import Otps from '../Model/EmailVerification.models.js';
import nodemailer from 'nodemailer'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const transpoter = nodemailer.createTransport({
  service:'Gmail',
  host:process.env.SMPT_HOST,
  auth:{
    user:process.env.SMPT_MAIL,
    pass:process.env.SMPT_APP_PASS
  }
})

export const Regsiter = async (req, res, next) => {
  try {
    const { FirstName, LastName, Email, Password } = req.body;
    const userEmail = await userDetail.findOne({ Email });
    if (userEmail) {
      return res
        .status(200)
        .json({
          success: false,
          message: "User is Already Exist please login",
        });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(Password, salt);
    const newUser = await userDetail({
      FirstName,
      LastName,
      Email,
      Password: hashPassword,
    });
    // newUser.save().then((result)=>{sendVerificationEmail(result,res)});
    // res
    //   .status(201)
    //   .json({ message: "User signed in successfully", success: true, newUser })
    const savedUser = await newUser.save();
    const verificationResult = await sendVerificationEmail(savedUser);
    
    return res
      .status(201)
      .json({ message: "User signed up successfully", success: true, newUser, verificationResult });
    next();
  } catch (error) {
    console.log("shwoing error in registration ", error);
  }
};

export const Login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (Email === 'admin@thecleaningcrew.com') {
      // Compare the password with the admin password stored in the environment
      const isMatch = Password === 'admin';

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid admin credentials" });
      }

      // Generate a token for the admin
      const accessToken = jwt.sign({ role: 'admin' }, process.env.JWT_KEY, { expiresIn: '1d' });

      return res.status(200).json({
        success: true,
        message: "Admin Login Successful",
        accessToken,
        role:"admin"
      });
    }
    
    const checkEmail = await userDetail.findOne({ Email });

    if (!checkEmail) {
      return res
        .status(201)
        .json({
          success: false,
          message: "You are not register first register",
          checkEmail
        });
    }
    if(!checkEmail.verified){
      return res.status(400).json({ success: false, message: "Email not verified. Please verify your email first." });
    }
    const checkPassword = await bcrypt.compare(Password, checkEmail.Password);
    if (!checkPassword) {
      return res
        .status(200)
        .json({
          success: false,
          message: "Password is not found please try again!",
        });
    }
    
    const accessToken = jwt.sign({id:checkEmail._id},process.env.JWT_KEY,{expiresIn:'1d'});
    res.status(200).json({ success: true, message: "Login Successfully",accessToken,role:"user" });
  } catch (error) {
    console.log("Error occur in Login Page", error);
  }
};

export const AuthVerification = async(req,res)=>{
  try {
    const {id} = req.body;
    const user = await userDetail.findOne({_id:id})
    if(!user){
      return res
      .status(201)
      .json({
        success: false,
        message: "user not found",
      });
    }
     res
    .status(200)
    .send({
      success: true,
      data:user
    });
  } catch (error) {
    console.log("shwoing error in Authorization ", error);
  }
}
const sendVerificationEmail = async ({ _id, Email }) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOption = {
      from: process.env.SMPT_MAIL,
      to: Email,
      subject: "Verify Your Email",
      html: `<p>Your OTP to verify your email is ${otp}</p>`,
    };

    const saltRound = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRound);
    const newOtp = new Otps({
      userId: _id,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour expiry
    });

    await newOtp.save();
    await transpoter.sendMail(mailOption);

    return { status: 'pending', message: 'Verification OTP sent',data:{userId:_id,Email} };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to send verification email');
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find OTP record by userId
    const otpRecord = await Otps.findOne({ userId });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    // Check if OTP has expired
    const currentTime = Date.now();
    if (otpRecord.expiresAt < currentTime) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Compare provided OTP with hashed OTP in the database
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    const user = await userDetail.findOneAndUpdate(
      {_id:userId},
      {$set:{verified:true}},
    )
      await sendWelcomeEmail(user.Email,user.FirstName);
    // OTP verification successful
    await Otps.deleteMany({ userId }); // Optionally delete OTP record after successful verification
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.log("Error during OTP verification: ", error);
    return res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};
const sendWelcomeEmail = async (Email,FirstName) => {
  console.log('Attempting to send welcome email to:', Email); // Debugging log
  try {
    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: Email,
      subject: 'Welcome to The Cleaning Crew!',
      html: `<h1>The Cleaning Crew , Welcome's, ${FirstName}!</h1>
             <p>Thank you for registering. We're excited to have you with us!</p>
             <p>If you have any questions, feel free to reach out to us.</p>`,
    };

    await transpoter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.log('Error sending welcome email:', error);
  }
};

export const AdminPanel = async (req, res) => {
  try {
    const users = await userDetail.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




