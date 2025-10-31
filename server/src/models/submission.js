import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        answer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        points: Number,
        maxPoints: Number,
      },
    ],
    totalScore: Number,
    maxScore: Number,
    percentage: Number,
    timeSpent: Number,
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' } }
);

export default mongoose.model('Submission', submissionSchema);
