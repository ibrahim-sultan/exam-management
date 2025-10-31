import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'multiple-answer', 'short-answer'], required: true },
    options: { type: [mongoose.Schema.Types.Mixed], default: [] },
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    points: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
