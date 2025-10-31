import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
