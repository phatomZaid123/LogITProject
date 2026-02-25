import Complaint from "../models/complaint.js";
import {
  createNotification,
  createNotificationsForRole,
} from "../utils/notificationUtils.js";
import { httpError } from "../utils/httpError.js";

const trimOrEmpty = (value = "") => String(value).trim();

export const createComplaintForCompany = async ({ companyUser, payload }) => {
  const { subject, category = "General", details } = payload || {};

  if (!subject || !trimOrEmpty(subject)) {
    throw httpError(400, "Subject is required");
  }

  if (!details || !trimOrEmpty(details)) {
    throw httpError(400, "Details are required");
  }

  const complaint = await Complaint.create({
    subject: trimOrEmpty(subject),
    category: trimOrEmpty(category) || "General",
    details: trimOrEmpty(details),
    company: companyUser._id,
    companyName: companyUser.company_name || companyUser.name,
    companyContactName: companyUser.name,
    companyEmail: companyUser.email,
    messages: [
      {
        authorRole: "company",
        authorName: companyUser.name || companyUser.company_name,
        body: trimOrEmpty(details),
      },
    ],
  });

  await createNotificationsForRole("dean", {
    type: "complaint_submitted",
    title: "New company complaint",
    message: `${companyUser.company_name || companyUser.name} submitted a complaint: ${complaint.subject}`,
    link: "/dean/dashboard/complaints",
    data: {
      complaintId: complaint._id,
      companyId: companyUser._id,
    },
  });

  return complaint;
};

export const listCompanyComplaints = async (companyId) => {
  return Complaint.find({ company: companyId }).sort({ createdAt: -1 }).lean();
};

export const listAllComplaints = async () => {
  return Complaint.find().sort({ createdAt: -1 }).lean();
};

export const replyToComplaintAsDean = async ({
  complaintId,
  body,
  deanName,
}) => {
  if (!body || !trimOrEmpty(body)) {
    throw httpError(400, "Reply body is required");
  }

  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw httpError(404, "Complaint not found");
  }

  complaint.messages.push({
    authorRole: "dean",
    authorName: deanName || "Dean",
    body: trimOrEmpty(body),
  });
  complaint.status = "responded";
  await complaint.save();

  await createNotification({
    recipient: complaint.company,
    recipientRole: "company",
    type: "complaint_replied",
    title: "Dean replied to your complaint",
    message: `Dean replied to complaint: ${complaint.subject}`,
    link: "/company/dashboard/complaints",
    data: {
      complaintId: complaint._id,
    },
  });

  return complaint;
};
