import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },

    correctIndex: {
      type: Number,
      default: 0,
    },

    mark: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: true,
  }
);

const LessonItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["video", "pdf", "exam"],
      required: true,
    },

    title: {
      type: String,
      required: [true, "عنوان العنصر مطلوب"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      required: true,
    },

    videoProvider: {
      type: String,
      enum: ["url", "cloudflare", "youtube", "vimeo", ""],
      default: "",
    },

    cloudflareVideoId: {
      type: String,
      default: "",
    },

    passScore: {
      type: Number,
      default: 50,
    },

    questions: {
      type: [QuestionSchema],
      default: [],
    },
  },
  {
    _id: true,
  }
);

const LessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "الكورس مطلوب"],
    },

    title: {
      type: String,
      required: [true, "عنوان المحاضرة مطلوب"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [LessonItemSchema],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 1,
    },

    lockedUntilExamPassed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson =
  mongoose.models.Lesson ||
  mongoose.model("Lesson", LessonSchema);

export default Lesson;