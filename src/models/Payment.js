import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "المبلغ مطلوب"],
      min: [0, "المبلغ يجب أن يكون أكبر من أو يساوي صفر"],
    },
    method: {
      type: String,
      enum: ["vodafone_cash", "instapay"],
      default: "vodafone_cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected", "expired"],
      default: "pending",
    },
    senderPhone: {
      type: String,
      trim: true,
      default: "",
    },
    referenceCode: {
      type: String,
      trim: true,
      default: "",
    },
    providerTransactionId: {
      type: String,
      trim: true,
      default: "",
    },
    proofImage: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ user: 1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);

export default Payment;
