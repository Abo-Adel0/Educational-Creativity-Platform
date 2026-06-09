import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "اسم الكتاب مطلوب"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    grade: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "سعر الكتاب مطلوب"],
      default: 0,
    },

    image: {
      type: String,
      default: "",
    },

    pdf: {
      type: String,
      default: "",
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

const Book =
  mongoose.models.Book ||
  mongoose.model("Book", BookSchema);

export default Book;