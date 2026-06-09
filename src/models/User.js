import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    studentPhone: {
      type: String,
      required: [true, "رقم الطالب مطلوب"],
      trim: true,
      unique: true,
    },
    parentPhone: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: [true, "كلمة السر مطلوبة"],
    },
    role: {
      type: String,
      enum: ["owner", "admin", "student"],
      default: "student",
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    paidCourses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ studentPhone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ blocked: 1 });
UserSchema.index({ createdAt: -1 });

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;
