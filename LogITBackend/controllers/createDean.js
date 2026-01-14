import User from "../models/user.js";
import Dean from "../models/dean.js";

const createDean = async (req, res) => {
  try {
    const { name, email, password, faculty } = req.body;

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create a new Dean instance
    const newDean = new Dean({ name, email, password, faculty });

    // Save the new Dean to the database
    await newDean.save();

    res
      .status(201)
      .json({ message: "Dean created successfully", dean: newDean });
  } catch (error) {
    console.error("Error creating dean:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export default createDean;