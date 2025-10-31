import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { mockExams, mockQuestions, User, Question } from '../lib/mockData';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExamTakingProps {
  examId: string;
  user: User;
  onComplete: (score: number, percentage: number) => void;
  onExit: () => void;
}

export default function ExamTaking({ examId, user, onComplete, onExit }: ExamTakingProps) {
  const exam = mockExams.find((e) => e.id === examId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    if (exam) {
      setTimeRemaining(exam.duration * 60); // Convert to seconds
    }
  }, [exam]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      if (exam?.settings.autoSubmit) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Tab switch detection
  useEffect(() => {
    if (!exam?.settings.detectTabSwitch) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        toast.warning('Tab switch detected! This has been logged.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [exam]);

  // Prevent copy/paste
  useEffect(() => {
    if (!exam?.settings.preventCopyPaste) return;

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error('Copy/paste is disabled during the exam');
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('cut', preventCopy);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('cut', preventCopy);
    };
  }, [exam]);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Exam not found</p>
            <Button onClick={onExit} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = exam.questions
    .map((qId) => mockQuestions.find((q) => q.id === qId))
    .filter((q): q is Question => q !== undefined);

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = (answer: string | number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = () => {
    let totalScore = 0;

    questions.forEach((question) => {
      const studentAnswer = answers[question.id];
      if (studentAnswer === undefined) return;

      const isCorrect =
        String(studentAnswer).toLowerCase() ===
        String(question.correctAnswer).toLowerCase();

      if (isCorrect) {
        totalScore += exam.markingScheme.correct * question.marks;
      } else {
        totalScore += exam.markingScheme.wrong * question.marks;
      }
    });

    // Ensure score is not negative
    totalScore = Math.max(0, totalScore);
    const percentage = (totalScore / exam.totalMarks) * 100;

    onComplete(totalScore, percentage);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2>{exam.title}</h2>
              <p className="text-sm text-muted-foreground">{exam.subject}</p>
            </div>
            <div className="flex items-center gap-6">
              {tabSwitches > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {tabSwitches} warnings
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span
                  className={
                    timeRemaining < 300 ? 'text-destructive' : ''
                  }
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>
                Answered: {answeredCount}/{questions.length}
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>Question {currentQuestionIndex + 1}</Badge>
                      <Badge variant="outline">{currentQuestion.marks} marks</Badge>
                      {flagged.has(currentQuestion.id) && (
                        <Badge variant="secondary">
                          <Flag className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFlag}
                    className={flagged.has(currentQuestion.id) ? 'text-orange-600' : ''}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.type === 'multiple_choice' && (
                  <RadioGroup
                    value={String(answers[currentQuestion.id] ?? '')}
                    onValueChange={(value) => handleAnswer(parseInt(value))}
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      >
                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'true_false' && (
                  <RadioGroup
                    value={String(answers[currentQuestion.id] ?? '')}
                    onValueChange={(value) => handleAnswer(parseInt(value))}
                  >
                    {['True', 'False'].map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      >
                        <RadioGroupItem value={String(index)} id={`tf-${index}`} />
                        <Label htmlFor={`tf-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'short_answer' && (
                  <Input
                    placeholder="Type your answer here..."
                    value={String(answers[currentQuestion.id] ?? '')}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={() => setShowSubmitDialog(true)} size="lg">
                      Submit Exam
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your answers are auto-saved. Do not close this window or switch tabs to avoid
                warnings.
              </AlertDescription>
            </Alert>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = answers[question.id] !== undefined;
                    const isFlagged = flagged.has(question.id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <Button
                        key={question.id}
                        variant={isCurrent ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(index)}
                        className="relative"
                      >
                        {index + 1}
                        {isAnswered && !isCurrent && (
                          <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
                        )}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-600" />
                        )}
                      </Button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded bg-primary" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded" />
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded" />
                    <Flag className="h-3 w-3 text-orange-600" />
                    <span>Flagged</span>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  Submit Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span>{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span>{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unanswered:</span>
                  <span>{questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged:</span>
                  <span>{flagged.size}</span>
                </div>
              </div>

              {answeredCount < questions.length && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have {questions.length - answeredCount} unanswered questions.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSubmitDialog(false)}
                >
                  Review Answers
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  Confirm Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
