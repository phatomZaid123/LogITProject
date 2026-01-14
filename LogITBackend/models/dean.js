// models/Dean.js
import mongoose from "mongoose";
import User from "./user.js";

const deanSchema = new mongoose.Schema({
  faculty: {
    type: String,
    required: true,
  },
});

const Dean = User.discriminator("dean", deanSchema);
export default Dean;
