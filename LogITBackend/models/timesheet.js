import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    timeIn: { type: String, required: true },
    timeOut: { type: String, required: true },
    breakMinutes: { type: Number, default: 0 }, // Added this field
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "submitted_to_company",
        "company_approved",
        "company_declined",
        "submitted_to_dean",
        "dean_approved",
        "dean_declined",
        "edited_by_company",
      ],
      default: "pending",
    },
    companyNotes: { type: String, default: "" },
    deanNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

timesheetSchema.pre("save", function () {
  if (
    this.isModified("timeIn") ||
    this.isModified("timeOut") ||
    this.isModified("breakMinutes")
  ) {
    const [inH, inM] = this.timeIn.split(":").map(Number);
    const [outH, outM] = this.timeOut.split(":").map(Number);

    let diffMinutes = outH * 60 + outM - (inH * 60 + inM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight

    // Deduct break minutes and ensure it doesn't go below zero
    const netMinutes = diffMinutes - (this.breakMinutes || 0);
    this.totalHours = parseFloat((Math.max(0, netMinutes) / 60).toFixed(2));
  }
});

const TIMESHEET = mongoose.model("Timesheet", timesheetSchema);
export { TIMESHEET };
