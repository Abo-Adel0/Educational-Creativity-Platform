import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم المدرس مطلوب"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "المادة مطلوبة"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Teacher =
  mongoose.models.Teacher ||
  mongoose.model("Teacher", TeacherSchema);

export default Teacher;