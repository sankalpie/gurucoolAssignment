import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  preference: { 
    type: String, 
    enum: ["more", "less", "neutral"], 
    default: "neutral" 
  },
  currentLoad: { type: Number, default: 0 },
  connectedUsers: [{ type: String }],
  hashedPassword: { type: String, required: true }
});

const Astrologer = mongoose.model("Astrologer", astrologerSchema);

export default Astrologer;