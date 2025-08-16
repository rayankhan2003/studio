
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ROLES } from "../utils/roles.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d"
  });

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role = ROLES.STUDENT } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email in use" });
    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    res.status(201).json({ token });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    res.json({ token });
  } catch (e) { next(e); }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json({ user });
  } catch (e) { next(e); }
};
