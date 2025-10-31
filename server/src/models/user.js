import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'moderator', 'student'], default: 'student' },
    studentId: { type: String },
    course: { type: String },
    year: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
