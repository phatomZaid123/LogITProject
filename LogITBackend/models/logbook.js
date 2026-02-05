import mongoose from "mongoose";

const logBookSchema = new mongoose.Schema(
  {
    // Week identification
    weekNumber: {
      type: Number,
      required: false,
    },
    weekStartDate: {
      type: Date,
      required: false,
    },
    weekEndDate: {
      type: Date,
      required: false,
    },

    // The 6 weekly logbook questions
    dutiesAndResponsibilities: {
      type: String,
      required: true,
      trim: true,
    },
    newThingsLearned: {
      type: String,
      required: true,
      trim: true,
    },
    problemsEncountered: {
      type: String,
      required: true,
      trim: true,
    },
    solutionsImplemented: {
      type: String,
      required: true,
      trim: true,
    },
    accomplishmentsAndDeliverables: {
      type: String,
      required: true,
      trim: true,
    },
    goalsForNextWeek: {
      type: String,
      required: true,
      trim: true,
    },

    // Array of attachments for both documents and pictures
    attachments: [
      {
        fileUrl: String, // Local disk
        fileType: String, // e.g., 'image', 'pdf'
        originalName: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },

    deanFeedback: {
      type: String,
      default: "",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const LOGBOOK = mongoose.model("Logbook", logBookSchema);

export { LOGBOOK };
