import User from "../models/user.js";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Batch from "../models/batch.js";
import Student from "../models/student.js";
import Company from "../models/company.js";

const normalizeText = (value = "") => String(value).trim();
const normalizeEmail = (value = "") => normalizeText(value).toLowerCase();
const normalizeCourse = (value = "") => normalizeText(value).toUpperCase();
const normalizeAdmissionNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  faculty: user.faculty,
  student_admission_number: user.student_admission_number,
  student_course: user.student_course,
  company_address: user.company_address,
  contact_person: user.contact_person,
  job_title: user.job_title,
  company_name: user.company_name,
  profile_image: user.profile_image,
});

const getMe = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error(error.message);
  }
};

const updateMe = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      faculty,
      student_course,
      company_address,
      job_title,
      contact_person,
      contact_person_name,
      contact_person_email,
    } = req.body || {};

    if (name !== undefined) {
      user.name = name?.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email?.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail }).select(
          "_id",
        );
        if (existing && existing._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      user.email = normalizedEmail;
    }

    if (user.role === "dean" && faculty !== undefined) {
      user.faculty = faculty?.trim();
    }

    if (user.role === "student" && student_course !== undefined) {
      user.student_course = student_course?.trim().toUpperCase();
    }

    if (user.role === "company") {
      if (company_address !== undefined) {
        user.company_address = company_address?.trim();
      }
      if (job_title !== undefined) {
        user.job_title = job_title?.trim();
      }

      const hasFlatContactPersonValues =
        contact_person_name !== undefined || contact_person_email !== undefined;

      if (contact_person !== undefined || hasFlatContactPersonValues) {
        user.contact_person = {
          name:
            contact_person_name !== undefined
              ? contact_person_name?.trim()
              : contact_person?.name !== undefined
                ? contact_person.name?.trim()
                : user.contact_person?.name,
          email:
            contact_person_email !== undefined
              ? contact_person_email?.trim().toLowerCase()
              : contact_person?.email !== undefined
                ? contact_person.email?.trim().toLowerCase()
                : user.contact_person?.email,
        };
      }
    }

    if (req.file?.filename) {
      user.profile_image = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Update Me Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      admission_number,
      student_course,
      token, // This is the UUID from the URL (e.g. "550e8400-e29b...")
    } = req.body;

    const normalizedName = normalizeText(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedCourse = normalizeCourse(student_course);
    const normalizedAdmissionNumber =
      normalizeAdmissionNumber(admission_number);
    const normalizedToken = normalizeText(token);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !normalizedAdmissionNumber ||
      !normalizedCourse ||
      !normalizedToken
    ) {
      return res.status(400).json({ message: "Please review inputs" });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    console.log("Received Token:", normalizedToken);

    // We look for a batch where 'student_invite_code' matches the 'token' provided
    const targetBatch = await Batch.findOne({
      student_invite_code: normalizedToken,
    });

    if (!targetBatch) {
      return res.status(404).json({ message: "Invalid Registration Link" });
    }

    // --- LOGIC CHECK: IS IT ACTIVE? ---
    if (!targetBatch.isActive) {
      return res.status(403).json({
        message:
          "This registration link has expired. The batch is no longer active.",
      });
    }
    console.log(admission_number);
    // Create the Student
    const newStudent = new Student({
      name: normalizedName,
      email: normalizedEmail,
      password,
      student_admission_number: normalizedAdmissionNumber,
      student_course: normalizedCourse,
      student_batch: targetBatch._id,
      ojt_hours_required: 500, // Default value
      role: "student",
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Registration successful! Please login.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      companyPassword,
      confirmPassword,
      companyAddress,
      companyContactPersonName,
      companyContactPersonEmail,
      jobTittle,
    } = req.body;

    const normalizedCompanyName = normalizeText(companyName);
    const normalizedCompanyEmail = normalizeEmail(companyEmail);
    const normalizedCompanyAddress = normalizeText(companyAddress);
    const normalizedContactPersonName = normalizeText(companyContactPersonName);
    const normalizedContactPersonEmail = normalizeEmail(
      companyContactPersonEmail,
    );
    const normalizedJobTitle = normalizeText(jobTittle);

    if (
      !normalizedCompanyName ||
      !normalizedCompanyEmail ||
      !companyPassword ||
      !normalizedCompanyAddress ||
      !normalizedContactPersonName ||
      !normalizedContactPersonEmail ||
      !normalizedJobTitle
    ) {
      return res.status(401).json({ message: "Please review inputs" });
    }

    if (confirmPassword !== undefined && companyPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const newCompany = new Company({
      name: normalizedCompanyName,
      email: normalizedCompanyEmail,
      password: companyPassword,
      company_address: normalizedCompanyAddress,
      contact_person: {
        name: normalizedContactPersonName,
        email: normalizedContactPersonEmail,
      },
      job_title: normalizedJobTitle,
      role: "company",
    });

    await newCompany.save();

    res.status(201).json({ message: `${newCompany} Successfully created` });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    //Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Check if company is suspended
    if (user.role === "company" && user.isSuspended) {
      return res.status(403).json({
        message:
          "Your company account has been suspended. Please contact the administrator.",
      });
    }

    //compare password
    const isMatch = await bycrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    //Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // SEND TOKEN AS A COOKIE
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // Use HTTPS in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    //send user data
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        faculty: user.faculty,
        profile_image: user.profile_image,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const logout = (req, res) => {
  // We overwrite the 'jwt' cookie with an immediate expiration date
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Set expiration to the past (Jan 1, 1970)
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Request password reset link
// @route   POST /api/auth/users/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      return res.status(200).json({
        message: "If the email exists, a reset link was created.",
        resetLink,
      });
    }

    return res.status(200).json({
      message: "If the email exists, a reset link was created.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to create reset link" });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/users/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export {
  login,
  logout,
  getMe,
  registerStudent,
  registerCompany,
  forgotPassword,
  resetPassword,
  updateMe,
};
