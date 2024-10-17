import { errorMessages } from "@/common/errors";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const sendPhone = createAsyncThunk(
  "auth/sendPhone",
  async (phone: string, { rejectWithValue }) => {
    try {
      const formattedPhone = phone.startsWith("8")
        ? `7${phone.slice(1)}`
        : phone;
      await axios.post("https://shift-backend.onrender.com/auth/otp", {
        phone: formattedPhone,
      });
      return phone;
    } catch (error) {
      return rejectWithValue(errorMessages.sendPhoneError);
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (
    { phone, otp }: { phone: string; otp: number },
    { rejectWithValue }
  ) => {
    try {
      const formattedPhone = phone.startsWith("8")
        ? `7${phone.slice(1)}`
        : phone;
      const response = await axios.post(
        "https://shift-backend.onrender.com/users/signin",
        { phone: formattedPhone, code: otp }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMessages.otpError);
    }
  }
);
