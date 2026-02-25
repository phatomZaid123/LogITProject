import asyncHandler from "../middleware/asyncHandler.js";
import {
  createComplaintForCompany,
  listAllComplaints,
  listCompanyComplaints,
  replyToComplaintAsDean,
} from "../services/complaintService.js";

export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await createComplaintForCompany({
    companyUser: req.user,
    payload: req.body,
  });

  return res.status(201).json({ complaint });
});

export const getCompanyComplaints = asyncHandler(async (req, res) => {
  const complaints = await listCompanyComplaints(req.user._id);
  return res.status(200).json({ complaints });
});

export const getAllComplaints = asyncHandler(async (_req, res) => {
  const complaints = await listAllComplaints();
  return res.status(200).json({ complaints });
});

export const replyToComplaint = asyncHandler(async (req, res) => {
  const complaint = await replyToComplaintAsDean({
    complaintId: req.params.complaintId,
    body: req.body?.body,
    deanName: req.user?.name,
  });

  return res.status(200).json({ complaint });
});
