import User from "../models/user.js";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getMe = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // "dean", "student", or "company"
        faculty: user.faculty, // Only for Deans
        student_id: user.student_id, // Only for Students
        company_name: user.company_name, // Only for Companies
      },
    });
  } catch (error) {
    console.error(error.message);
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

    //compare password
    const isMatch = await bycrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    //Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
export { login, logout, getMe };
