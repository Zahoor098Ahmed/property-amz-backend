import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  totalProjects: { type: Number, default: 0 },
  description: { type: String },
  specialties: [String],
}, { timestamps: true });

export default mongoose.model("Partner", partnerSchema);
