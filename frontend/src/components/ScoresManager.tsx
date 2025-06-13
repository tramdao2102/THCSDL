import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, User, FileText, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Score {
  score_id: number;
  student_id: number;
  student_name: string;
  test_id: number;
  test_name: string;
  listening_score: number;
  speaking_score: number;
  reading_score: number;
  writing_score: number;
  total_score: number;
  grade: string;
  notes: string;
  teacher_id: number;
  teacher_name: string;
  created_date: string;
}

const ScoresManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  const [scores, setScores] = useState<Score[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch scores, students, tests, teachers from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/scores").then(res => res.json()),
      fetch("http://localhost:5000/api/students").then(res => res.json()),
      fetch("http://localhost:5000/api/tests").then(res => res.json()),
      fetch("http://localhost:5000/api/teachers").then(res => res.json())
    ])
      .then(([scoresData, studentsData, testsData, teachersData]) => {
        setScores(scoresData);
        setStudents(studentsData);
        setTests(testsData);
        setTeachers(teachersData);
      })
      .catch(() => toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const calculateGrade = (totalScore: number): string => {
    if (totalScore >= 9.0) return 'A';
    if (totalScore >= 8.0) return 'B+';
    if (totalScore >= 7.0) return 'B';
    if (totalScore >= 6.0) return 'C+';
    if (totalScore >= 5.0) return 'C';
    return 'F';
  };

  const handleSaveScore = async (scoreData: Omit<Score, 'score_id' | 'student_name' | 'test_name' | 'teacher_name'>) => {
    // Tính lại total_score và grade
    const rawTotal = (scoreData.listening_score + scoreData.speaking_score + scoreData.reading_score + scoreData.writing_score) / 4;
    const totalScore = Math.ceil(rawTotal * 2) / 2; // Làm tròn lên .0 hoặc .5
    const grade = calculateGrade(totalScore);

    const payload = {
      ...scoreData,
      total_score: totalScore,
      grade
    };

    if (editingScore) {
      // Update score
      const res = await fetch(`http://localhost:5000/api/scores/${editingScore.score_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setScores(prev => prev.map(s => s.score_id === updated.score_id ? updated : s));
        toast({ title: "Score Updated", description: "Score information has been successfully updated." });
      } else {
        toast({ title: "Error", description: "Failed to update score", variant: "destructive" });
      }
    } else {
      // Add score
      const res = await fetch("http://localhost:5000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newScore = await res.json();
        setScores(prev => [...prev, newScore]);
        toast({ title: "Score Added", description: "New score has been successfully added." });
      } else {
        toast({ title: "Error", description: "Failed to add score", variant: "destructive" });
      }
    }
    setIsDialogOpen(false);
    setEditingScore(null);
  };

  const handleDeleteScore = async (scoreId: number) => {
    const res = await fetch(`http://localhost:5000/api/scores/${scoreId}`, { method: "DELETE" });
    if (res.ok) {
      setScores(prev => prev.filter(s => s.score_id !== scoreId));
      toast({ title: "Score Deleted", description: "Score has been successfully removed." });
    } else {
      toast({ title: "Error", description: "Failed to delete score", variant: "destructive" });
    }
  };

  const filteredScores = scores.filter(score =>
    score.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    score.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search scores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingScore(null)}
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Score
            </Button>
          </DialogTrigger>
          <ScoreDialog 
            score={editingScore}
            students={students}
            tests={tests}
            teachers={teachers}
            onSave={handleSaveScore}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingScore(null);
            }}
          />
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">Loading scores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScores.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
              <p className="text-sm text-muted-foreground">No scores found. Try adjusting your search.</p>
            </div>
          ) : (
            filteredScores.map((score) => (
              <Card key={score.score_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{score.student_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{score.test_name}</p>
                      <Badge className={getGradeColor(score.grade)}>
                        Grade: {score.grade}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingScore(score);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteScore(score.score_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Listening:</span>
                      <span className="font-medium ml-1">{score.listening_score}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speaking:</span>
                      <span className="font-medium ml-1">{score.speaking_score}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reading:</span>
                      <span className="font-medium ml-1">{score.reading_score}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Writing:</span>
                      <span className="font-medium ml-1">{score.writing_score}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-bold">
                        Total: {(Math.ceil(score.total_score * 2) / 2).toFixed(1)}
                      </span>
                    </div>
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Graded by: {score.teacher_name}</span>
                  </div>
                  
                  {score.notes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {score.notes}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Recorded: {new Date(score.created_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ScoreDialog = ({ 
  score, 
  students,
  tests,
  teachers,
  onSave, 
  onClose 
}: { 
  score: Score | null;
  students: any[];
  tests: any[];
  teachers: any[];
  onSave: (data: Omit<Score, 'score_id' | 'student_name' | 'test_name' | 'teacher_name'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    student_id: score?.student_id || 0,
    test_id: score?.test_id || 0,
    listening_score: score?.listening_score || 0,
    speaking_score: score?.speaking_score || 0,
    reading_score: score?.reading_score || 0,
    writing_score: score?.writing_score || 0,
    notes: score?.notes || "",
    teacher_id: score?.teacher_id || 0,
    created_date: score?.created_date || new Date().toISOString().split('T')[0]
  });

  const calculateTotal = () => {
    const rawTotal = (formData.listening_score + formData.speaking_score + formData.reading_score + formData.writing_score) / 4;
    return Math.ceil(rawTotal * 2) / 2; // Làm tròn lên .0 hoặc .5
  };

  const calculateGrade = (totalScore: number): string => {
    if (totalScore >= 9.0) return 'A';
    if (totalScore >= 8.0) return 'B+';
    if (totalScore >= 7.0) return 'B';
    if (totalScore >= 6.0) return 'C+';
    if (totalScore >= 5.0) return 'C';
    return 'F';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Score, 'score_id' | 'student_name' | 'test_name' | 'teacher_name'>);
  };

  const totalScore = calculateTotal();
  const grade = calculateGrade(totalScore);

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{score ? 'Edit Score' : 'Add New Score'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="student_id">Student</Label>
          <Select value={formData.student_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.student_id} value={student.student_id.toString()}>
                  {student.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="test_id">Test</Label>
          <Select value={formData.test_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, test_id: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {tests.map(test => (
                <SelectItem key={test.test_id} value={test.test_id.toString()}>
                  {test.test_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="listening_score">Listening Score</Label>
            <Input
              id="listening_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.listening_score}
              onChange={(e) => setFormData(prev => ({ ...prev, listening_score: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div>
            <Label htmlFor="speaking_score">Speaking Score</Label>
            <Input
              id="speaking_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.speaking_score}
              onChange={(e) => setFormData(prev => ({ ...prev, speaking_score: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reading_score">Reading Score</Label>
            <Input
              id="reading_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.reading_score}
              onChange={(e) => setFormData(prev => ({ ...prev, reading_score: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div>
            <Label htmlFor="writing_score">Writing Score</Label>
            <Input
              id="writing_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.writing_score}
              onChange={(e) => setFormData(prev => ({ ...prev, writing_score: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Score:</span>
            <span className="text-lg font-bold">{totalScore.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Grade:</span>
            <span className="text-lg font-bold">{grade}</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="teacher_id">Grading Teacher</Label>
          <Select value={formData.teacher_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, teacher_id: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map(teacher => (
                <SelectItem key={teacher.teacher_id} value={teacher.teacher_id.toString()}>
                  {teacher.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional comments about the student's performance"
          />
        </div>
        
        <div>
          <Label htmlFor="created_date">Test Date</Label>
          <Input
            id="created_date"
            type="date"
            value={formData.created_date}
            onChange={(e) => setFormData(prev => ({ ...prev, created_date: e.target.value }))}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {score ? 'Update' : 'Add'} Score
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default ScoresManager;
