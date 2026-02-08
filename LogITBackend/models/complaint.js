import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    authorRole: {
      type: String,
      enum: ["company", "dean"],
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const complaintSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "responded"],
      default: "open",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyContactName: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
