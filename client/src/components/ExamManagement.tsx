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
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { mockExams, mockQuestions, Exam } from '../lib/mockData';
import { Plus, Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    startDate: '',
    endDate: '',
    subject: '',
    classGroup: '',
    passingMarks: 50,
    correctMarks: 1,
    wrongMarks: -0.25,
    randomizeQuestions: true,
    randomizeOptions: true,
    autoSubmit: true,
    showResults: true,
    allowReview: true,
    preventCopyPaste: true,
    detectTabSwitch: true,
  });

  const handleCreateExam = () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    const totalMarks = selectedQuestions.reduce((sum, qId) => {
      const q = mockQuestions.find((qu) => qu.id === qId);
      return sum + (q?.marks || 0);
    }, 0);

    const newExam: Exam = {
      id: `exam-${exams.length + 1}`,
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
      startDate: formData.startDate,
      endDate: formData.endDate,
      subject: formData.subject,
      classGroup: formData.classGroup,
      totalMarks,
      passingMarks: formData.passingMarks,
      questions: selectedQuestions,
      markingScheme: {
        correct: formData.correctMarks,
        wrong: formData.wrongMarks,
      },
      settings: {
        randomizeQuestions: formData.randomizeQuestions,
        randomizeOptions: formData.randomizeOptions,
        autoSubmit: formData.autoSubmit,
        showResults: formData.showResults,
        allowReview: formData.allowReview,
        preventCopyPaste: formData.preventCopyPaste,
        detectTabSwitch: formData.detectTabSwitch,
      },
      status: 'draft',
      createdBy: 'admin-1',
      createdAt: new Date().toISOString(),
    };

    setExams([...exams, newExam]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('Exam created successfully!');
  };

  const handleDeleteExam = (id: string) => {
    setExams(exams.filter((e) => e.id !== id));
    toast.success('Exam deleted successfully!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 60,
      startDate: '',
      endDate: '',
      subject: '',
      classGroup: '',
      passingMarks: 50,
      correctMarks: 1,
      wrongMarks: -0.25,
      randomizeQuestions: true,
      randomizeOptions: true,
      autoSubmit: true,
      showResults: true,
      allowReview: true,
      preventCopyPaste: true,
      detectTabSwitch: true,
    });
    setSelectedQuestions([]);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      scheduled: 'default',
      active: 'default',
      completed: 'outline',
    };
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const ExamForm = () => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3>Basic Information</h3>
        <div className="space-y-2">
          <Label>Exam Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Mid-Term Mathematics Test"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the exam..."
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
            <Label>Class/Group</Label>
            <Input
              value={formData.classGroup}
              onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
              placeholder="e.g., Class 10-A"
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h3>Schedule</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <Input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <Input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Marking Scheme */}
      <div className="space-y-4">
        <h3>Marking Scheme</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Marks for Correct Answer</Label>
            <Input
              type="number"
              step="0.25"
              value={formData.correctMarks}
              onChange={(e) =>
                setFormData({ ...formData, correctMarks: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Marks for Wrong Answer</Label>
            <Input
              type="number"
              step="0.25"
              value={formData.wrongMarks}
              onChange={(e) =>
                setFormData({ ...formData, wrongMarks: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Passing Marks (%)</Label>
            <Input
              type="number"
              value={formData.passingMarks}
              onChange={(e) =>
                setFormData({ ...formData, passingMarks: parseInt(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      {/* Questions Selection */}
      <div className="space-y-4">
        <h3>Select Questions</h3>
        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
          {mockQuestions.map((question) => (
            <div key={question.id} className="flex items-start gap-3 py-2">
              <Checkbox
                checked={selectedQuestions.includes(question.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedQuestions([...selectedQuestions, question.id]);
                  } else {
                    setSelectedQuestions(
                      selectedQuestions.filter((id) => id !== question.id)
                    );
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{question.question}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {question.subject}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {question.marks} marks
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Selected: {selectedQuestions.length} questions
        </p>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3>Exam Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Randomize Questions</Label>
            <Switch
              checked={formData.randomizeQuestions}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, randomizeQuestions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Randomize Answer Options</Label>
            <Switch
              checked={formData.randomizeOptions}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, randomizeOptions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto Submit When Time Ends</Label>
            <Switch
              checked={formData.autoSubmit}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, autoSubmit: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Results Immediately</Label>
            <Switch
              checked={formData.showResults}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showResults: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Allow Review After Submission</Label>
            <Switch
              checked={formData.allowReview}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allowReview: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Prevent Copy/Paste</Label>
            <Switch
              checked={formData.preventCopyPaste}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, preventCopyPaste: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Detect Tab Switching</Label>
            <Switch
              checked={formData.detectTabSwitch}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, detectTabSwitch: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Exam Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage examinations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Configure your exam settings and select questions
              </DialogDescription>
            </DialogHeader>
            <ExamForm />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExam}>Create Exam</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Exams ({exams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <div>
                      <p>{exam.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(exam.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{exam.classGroup}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exam.duration}m
                    </div>
                  </TableCell>
                  <TableCell>{exam.questions.length}</TableCell>
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
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
