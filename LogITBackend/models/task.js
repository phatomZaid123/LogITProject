import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Company-provided resources (briefs, templates, etc.)
    companyAttachments: [
      {
        fileUrl: String,
        fileType: String,
        originalName: String,
      },
    ],
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    created_by_company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "in-progress", "submitted", "completed"],
      default: "assigned",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    related_log: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logbook",
    },
  },
  {
    timestamps: true,
  },
);

const TASK = mongoose.model("Task", taskSchema);

export { TASK };
