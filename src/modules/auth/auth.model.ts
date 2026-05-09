import mongoose from "mongoose";
import { IAuth } from "../../types/authTypes";

const authSchema = new mongoose.Schema<IAuth>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshTokens: [
      {
        token: String,
        createdAt:{
          type: Date,
          default: Date.now,
        },
      },
    ],

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
);

const AuthModel = mongoose.model("Auth", authSchema) || mongoose.models.Auth;

export default AuthModel;
