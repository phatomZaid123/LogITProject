import mongoose from "mongoose";
import User from "./user.js";

const companySchema = new mongoose.Schema({
  company_address: {
    type: String,
    required: true,
  },
  // This is the specific person at the company (the supervisor)
  contact_person: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  job_title: {
    type: String, // e.g., "IT Manager" or "Lead Developer"
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspendedAt: {
    type: Date,
  },
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Company = User.discriminator("company", companySchema);
export default Company;
