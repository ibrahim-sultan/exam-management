import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { mockQuestions, Question } from '../lib/mockData';
import { Plus, Upload, Edit, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    subject: '',
    topic: '',
    difficulty: 'medium',
    marks: 1,
  });

  const subjects = [...new Set(questions.map((q) => q.subject))];
  const types = ['multiple_choice', 'true_false', 'short_answer'];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesType = filterType === 'all' || q.type === filterType;
    return matchesSearch && matchesSubject && matchesType;
  });

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      type: formData.type as any,
      question: formData.question,
      options: formData.type !== 'short_answer' ? formData.options : undefined,
      correctAnswer:
        formData.type === 'multiple_choice'
          ? parseInt(formData.correctAnswer)
          : formData.correctAnswer,
      explanation: formData.explanation,
      subject: formData.subject,
      topic: formData.topic,
      difficulty: formData.difficulty as any,
      marks: formData.marks,
      createdAt: new Date().toISOString(),
    };

    setQuestions([...questions, newQuestion]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Question added successfully!');
  };

  const handleEditQuestion = () => {
    if (!editingQuestion) return;

    const updatedQuestions = questions.map((q) =>
      q.id === editingQuestion.id
        ? {
            ...q,
            question: formData.question,
            type: formData.type as any,
            options: formData.type !== 'short_answer' ? formData.options : undefined,
            correctAnswer:
              formData.type === 'multiple_choice'
                ? parseInt(formData.correctAnswer)
                : formData.correctAnswer,
            explanation: formData.explanation,
            subject: formData.subject,
            topic: formData.topic,
            difficulty: formData.difficulty as any,
            marks: formData.marks,
          }
        : q
    );

    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    resetForm();
    toast.success('Question updated successfully!');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success('Question deleted successfully!');
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      subject: '',
      topic: '',
      difficulty: 'medium',
      marks: 1,
    });
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correctAnswer:
        typeof question.correctAnswer === 'number'
          ? question.correctAnswer.toString()
          : question.correctAnswer,
      explanation: question.explanation || '',
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      marks: question.marks,
    });
  };

  const QuestionForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter your question here..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                type: value,
                options: value === 'true_false' ? ['True', 'False'] : formData.options,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Marks</Label>
          <Input
            type="number"
            min="1"
            value={formData.marks}
            onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
          />
        </div>
      </div>

      {formData.type !== 'short_answer' && (
        <div className="space-y-2">
          <Label>Options</Label>
          {formData.options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...formData.options];
                  newOptions[index] = e.target.value;
                  setFormData({ ...formData, options: newOptions });
                }}
                placeholder={`Option ${index + 1}`}
                disabled={formData.type === 'true_false'}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>Correct Answer</Label>
        {formData.type === 'multiple_choice' ? (
          <Select
            value={formData.correctAnswer}
            onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select correct option" />
            </SelectTrigger>
            <SelectContent>
              {formData.options.map((option, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Option {index + 1}: {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : formData.type === 'true_false' ? (
          <Select
            value={formData.correctAnswer}
            onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">True</SelectItem>
              <SelectItem value="1">False</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            placeholder="Enter the correct answer"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Explanation (Optional)</Label>
        <Textarea
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain the correct answer..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Mathematics"
          />
        </div>

        <div className="space-y-2">
          <Label>Topic</Label>
          <Input
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Algebra"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Question Bank</h1>
          <p className="text-muted-foreground mt-1">Manage your examination questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Bulk upload feature coming soon!')}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  Create a new question for your question bank
                </DialogDescription>
              </DialogHeader>
              <QuestionForm />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md">
                    <p className="truncate">{question.question}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {question.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.subject}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        question.difficulty === 'easy'
                          ? 'default'
                          : question.difficulty === 'hard'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.marks}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Question</DialogTitle>
                            <DialogDescription>
                              Update the question details
                            </DialogDescription>
                          </DialogHeader>
                          <QuestionForm />
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setEditingQuestion(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleEditQuestion}>Save Changes</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
