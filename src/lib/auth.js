import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { connectDB } from "./db";
import User from "../models/User";

const ownerPhones = process.env.OWNER_PHONES
  ? process.env.OWNER_PHONES.split(",").map((phone) => phone.trim())
  : ["01280522844", "01065955112"];

const normalizePhone = (phone) => {
  let value = String(phone || "").trim().replace(/[^\d]/g, "");

  if (value.startsWith("0020")) {
    value = "0" + value.slice(4);
  }

  if (value.startsWith("20") && value.length === 12) {
    value = "0" + value.slice(2);
  }

  return value;
};

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET غير موجود في Environment Variables");
  }

  return jwtSecret;
}

export const isOwnerPhone = (phone) => {
  return ownerPhones.includes(normalizePhone(phone));
};

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      studentPhone: user.studentPhone,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

export const getCurrentUserFromRequest = async (request) => {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);

    await connectDB();

    const user = await User.findById(decoded.id).lean();

    if (!user || (user.blocked && user.role === "student")) {
      return null;
    }

    return {
      id: user._id.toString(),
      _id: user._id.toString(),
      studentPhone: user.studentPhone,
      parentPhone: user.parentPhone || "",
      role: user.role,
      blocked: user.blocked,
      paidCourses: user.paidCourses || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    return null;
  }
};

export const requireAuth = async (request) => {
  const user = await getCurrentUserFromRequest(request);

  if (!user) {
    return null;
  }

  return user;
};

export const requireAdmin = async (request) => {
  const user = await getCurrentUserFromRequest(request);

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return null;
  }

  return user;
};

export const requireOwner = async (request) => {
  const user = await getCurrentUserFromRequest(request);

  if (!user || user.role !== "owner") {
    return null;
  }

  return user;
};

export const createAuthCookie = (token) => {
  return {
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  };
};

export const clearAuthCookie = () => {
  return {
    name: "auth_token",
    value: "",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  };
};
