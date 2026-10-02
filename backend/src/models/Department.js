import mongoose from "mongoose";
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hod_name: String,
}, { timestamps: true });
export default mongoose.model("Department", schema);