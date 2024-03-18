// import mongoose from "mongoose";

// const userSchema = mongoose.Schema({
//     name: {
//         type: String,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     otp: {
//         type: String,
//         default: null,
//     }
// },
//     {
//         timestamps: true,   
//     }
// );

// const User = mongoose.models.User || mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: otpSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
