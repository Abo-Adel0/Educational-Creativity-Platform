import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "اسم الكورس مطلوب"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    grade: {
      type: String,
      required: [true, "الصف الدراسي مطلوب"],
      enum: [
        "first-prep",
        "second-prep",
        "third-prep",
        "first-secondary",
        "second-secondary",
        "third-secondary",
      ],
    },

    price: {
      type: Number,
      required: [true, "سعر الكورس مطلوب"],
      default: 0,
    },

    image: {
      type: String,
      default: "",
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    lessonsCount: {
      type: Number,
      default: 0,
    },

    videosCount: {
      type: Number,
      default: 0,
    },

    filesCount: {
      type: Number,
      default: 0,
    },

    examsCount: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index({ isPublished: 1, isFeatured: -1, grade: 1 });
CourseSchema.index({ teacher: 1 });
CourseSchema.index({ createdAt: -1 });

const Course =
  mongoose.models.Course ||
  mongoose.model("Course", CourseSchema);

export default Course;