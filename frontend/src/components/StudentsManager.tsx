import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  student_id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  registration_date: string;
  status: string;
}

const StudentsManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch students from backend (PostgreSQL)
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => toast({ title: "Error", description: "Failed to fetch students", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSaveStudent = async (studentData: Omit<Student, 'student_id'>) => {
    try {
      if (editingStudent) {
        // Update student
        const res = await fetch(`http://localhost:5000/api/students/${editingStudent.student_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData)
        });
        if (res.ok) {
          const updated = await res.json();
          setStudents(prev => prev.map(s => s.student_id === updated.student_id ? updated : s));
          toast({ title: "Student Updated", description: "Student information has been successfully updated." });
        } else {
          toast({ title: "Error", description: "Failed to update student", variant: "destructive" });
        }
      } else {
        // Add student
        const res = await fetch("http://localhost:5000/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData)
        });
        if (res.ok) {
          const newStudent = await res.json();
          setStudents(prev => [newStudent, ...prev]);
          toast({ title: "Student Added", description: "New student has been successfully added." });
        } else {
          toast({ title: "Error", description: "Failed to add student", variant: "destructive" });
        }
      }
      setIsDialogOpen(false);
      setEditingStudent(null);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save student", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`, { method: "DELETE" });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.student_id !== studentId));
        toast({ title: "Student Deleted", description: "Student has been successfully removed." });
      } else {
        toast({ title: "Error", description: "Failed to delete student", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete student", 
        variant: "destructive" 
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingStudent(null)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <StudentDialog 
            student={editingStudent} 
            onSave={handleSaveStudent}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingStudent(null);
            }}
          />
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading students...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.student_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{student.full_name}</CardTitle>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-1">
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingStudent(student);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteStudent(student.student_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {student.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {student.address}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Registered:</span> {formatDate(student.registration_date)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!loading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found</p>
        </div>
      )}
    </div>
  );
};

const StudentDialog = ({ 
  student, 
  onSave, 
  onClose 
}: { 
  student: Student | null;
  onSave: (data: Omit<Student, 'student_id'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    full_name: student?.full_name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    address: student?.address || "",
    date_of_birth: student?.date_of_birth || "",
    gender: student?.gender || "M" as 'M' | 'F',
    registration_date: student?.registration_date || new Date().toISOString().split('T')[0],
    status: student?.status || "ACTIVE"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'M' | 'F' }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {student ? 'Update' : 'Add'} Student
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default StudentsManager;