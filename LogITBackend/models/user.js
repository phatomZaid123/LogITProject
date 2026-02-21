import mongoose from "mongoose";
import bycrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    role: { type: String },
    faculty: { type: String },
    company_name: { type: String },
    profile_image: { type: String, default: "" },
  },
  {
    discriminatorKey: "role",

    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  //hash the password before saving
  this.password = await bycrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

export default User;
