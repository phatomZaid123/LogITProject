import Complaint from "../models/complaint.js";

const trimOrEmpty = (value = "") => value.trim();

export const createComplaint = async (req, res) => {
  const { subject, category = "General", details } = req.body;

  if (!subject || !trimOrEmpty(subject)) {
    return res.status(400).json({ message: "Subject is required" });
  }

  if (!details || !trimOrEmpty(details)) {
    return res.status(400).json({ message: "Details are required" });
  }

  try {
    const companyUser = req.user;

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

    return res.status(201).json({ complaint });
  } catch (error) {
    console.error("Create complaint error", error);
    return res.status(500).json({ message: "Failed to create complaint" });
  }
};

export const getCompanyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ company: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ complaints });
  } catch (error) {
    console.error("Fetch company complaints error", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch company complaints" });
  }
};

export const getAllComplaints = async (_req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();
    return res.json({ complaints });
  } catch (error) {
    console.error("Fetch complaints error", error);
    return res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

export const replyToComplaint = async (req, res) => {
  const { complaintId } = req.params;
  const { body } = req.body;

  if (!body || !trimOrEmpty(body)) {
    return res.status(400).json({ message: "Reply body is required" });
  }

  try {
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.messages.push({
      authorRole: "dean",
      authorName: req.user?.name || "Dean",
      body: trimOrEmpty(body),
    });
    complaint.status = "responded";
    await complaint.save();

    return res.json({ complaint });
  } catch (error) {
    console.error("Reply complaint error", error);
    return res.status(500).json({ message: "Failed to add reply" });
  }
};
