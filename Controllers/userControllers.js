import pkg from "bcryptjs";
import User from "../Models/userModel.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();
const { hash, compare } = pkg;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    } else {
      const hashPass = await hash(password, 10);
      const newUser = new User({ name, email, password: hashPass });
      const savedUser = await newUser.save();
      res.status(201).json({
        message: "User registered successfully",
        user: savedUser,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email: email });

//     // console.log(user);
    

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const NewOtp = otpGenerator.generate(4, {
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });

    
//     const hashOtp = await hash(NewOtp, 10);
    
//     console.log(hashOtp);

//     user.otp = hashOtp;
//     await user.save();

//     console.log("user",user);

//     const info = await transporter.sendMail({
//       from: '"Maddison Foo Koch 👻" <vedantthakre7@gmail.com>',
//       to: email,
//       subject: "Password Reset OTP",
//       text: `Hello ${user.name} your requested for changing the password and your OTP ( one time password) is ${NewOtp}`,
//     });

//     console.log("Message sent: %s", info.messageId);

//     const { password, otp, ...userData } = user._doc;

//     res.status(200).json({
//       message: "OTP sent to your email",
//       user: userData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//     });
//   }
// };

// export const matchOtp = async (req, res) => {
//   const { email, otp } = req.body;
//   try {
//     const user = await User.findOne({ email: email });
//     const isOtpValid = await compare(otp, user.otp);
//     if (!isOtpValid) {
//       return res.status(401).json({ message: "Invalid OTP" });
//     }

//     res.status(200).json({ message: "Success", email: email });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//     });
//   }
// };

// export const changePassword = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email: email });

//     const hashPass = await hash(password, 10);

//     user.password = password;
//     await user.save();

//     res.status(200).json({ message: "Password changed successsfully" });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//     });
//   }
// };


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP with expiration time (e.g., 5 minutes)
    const expirationMinutes = 0.5;
    const newOtp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const hashOtp = await hash(newOtp, 10);

    // Store OTP and its expiration time in user document
    user.otp = {
      code: hashOtp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationMinutes * 60000), // Set expiration time
    };
    await user.save();

    // console.log(user.otp);

    // Send OTP to user's email
    const info = await transporter.sendMail({
      from: `Hi ${process.env.EMAIL}`,
      to: email,
      subject: "Password Reset OTP",
      text: `Hello ${user.name}, you requested for changing the password and your OTP is ${newOtp}`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const matchOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    const currentTime = new Date();
    if (currentTime > user.otp.expiresAt) {
      return res.status(401).json({ message: "OTP has expired" });
    }

    const isOtpValid = await compare(otp, user.otp.code);
    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP is valid, proceed with password change
    res.status(200).json({ message: "Success", email: email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password before saving
    const hashPass = await hash(password, 10);
    user.password = hashPass;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};