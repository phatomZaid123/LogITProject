import mongoose from "mongoose";
import User from "./user.js";

const companySchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
   
  },
  company_address: {
    type: String,
    required: true,
  },
  // This is the specific person at the company (the supervisor)
  contact_person: {
    type: String,
    required: true,
  },
  job_title: {
    type: String, // e.g., "IT Manager" or "Lead Developer"
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
});

const Company = User.discriminator("company", companySchema);
export default Company;
