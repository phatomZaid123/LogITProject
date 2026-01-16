import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    session_name: {
      type: String,
      required: true,
    }, // e.g., "2025/2026"
    year: {
      type: Number,
      required: true,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Invite codes usually live here
    student_invite_code: { type: String, unique: true, sparse: true },
    company_invite_code: { type: String },
  },
  { timestamps: true }
);

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;
