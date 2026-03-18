import mongoose from "mongoose";

const ratingField = {
  type: Number,
  required: true,
  min: 1,
  max: 5,
};

const evaluationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
      index: true,
    },
    ratings: {
      qualityOfWork: ratingField,
      quantityOfWork: ratingField,
      jobKnowledge: ratingField,
      dependability: ratingField,
      attendance: ratingField,
      punctuality: ratingField,
      trustworthinessReliability: ratingField,
      initiativeCooperation: ratingField,
      willingnessToLearn: ratingField,
      grooming: ratingField,
      interpersonalSkills: ratingField,
      courtesy: ratingField,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    strengths: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    areasForImprovement: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    additionalComments: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    remarks: {
      type: [String],
      enum: [
        "absorb_student",
        "consider_future_hiring",
        "highly_recommended",
        "moderately_recommended",
        "not_recommended",
        "needs_orientation",
      ],
      default: [],
      validate: {
        validator: (values) => Array.isArray(values) && values.length > 0,
        message: "At least one remark is required",
      },
    },
    approvedHours: {
      type: Number,
      required: true,
      min: 0,
    },
    requiredHours: {
      type: Number,
      required: true,
      min: 1,
    },
    eligibleByHours: {
      type: Boolean,
      required: true,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

evaluationSchema.index({ student: 1, company: 1 }, { unique: true });

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;
