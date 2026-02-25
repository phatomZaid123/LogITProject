import mongoose from "mongoose";

const MAX_LOGBOOK_WORDS_PER_ANSWER = 200;

const countWords = (value = "") =>
  String(value).trim().split(/\s+/).filter(Boolean).length;

const buildAnswerField = () => ({
  type: String,
  required: true,
  trim: true,
  validate: {
    validator: (value) => countWords(value) <= MAX_LOGBOOK_WORDS_PER_ANSWER,
    message: `Each answer must not exceed ${MAX_LOGBOOK_WORDS_PER_ANSWER} words.`,
  },
});

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
    dutiesAndResponsibilities: buildAnswerField(),
    newThingsLearned: buildAnswerField(),
    problemsEncountered: buildAnswerField(),
    solutionsImplemented: buildAnswerField(),
    accomplishmentsAndDeliverables: buildAnswerField(),
    goalsForNextWeek: buildAnswerField(),

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
      enum: ["draft", "pending", "approved", "declined"],
      default: "draft",
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
