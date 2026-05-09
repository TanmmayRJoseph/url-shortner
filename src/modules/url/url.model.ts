import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
    },

    originalUrl: {
      type: String,
      required: true,
    },

    shortCode: {
      type: String,
      unique: true,
      index: true,
    },

    shortUrl: {
      type: String,
      unique: true,
    },
    expiresAt: Date,

    isExpired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

const UrlModel = mongoose.model("Url", urlSchema) || mongoose.models.Url;

export default UrlModel;
