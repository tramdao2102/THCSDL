import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Mail, Phone, GraduationCap, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  teacher_id: number;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  experience_years: number;
  salary: number;
  hire_date: string;
  status: string;
}

const TeachersManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch teachers from backend
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to fetch teachers", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeacher = async (teacherData: Omit<Teacher, 'teacher_id'>) => {
    try {
      if (editingTeacher) {
        // Update teacher
        const res = await fetch(`http://localhost:5000/api/teachers/${editingTeacher.teacher_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teacherData)
        });
        if (!res.ok) throw new Error("Failed to update teacher");
        const updated = await res.json();
        setTeachers(prev => prev.map(t => t.teacher_id === updated.teacher_id ? updated : t));
        toast({ 
          title: "Teacher Updated", 
          description: "Teacher information has been successfully updated." 
        });
      } else {
        // Add teacher
        const res = await fetch("http://localhost:5000/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teacherData)
        });
        if (!res.ok) throw new Error("Failed to add teacher");
        const newTeacher = await res.json();
        setTeachers(prev => [newTeacher, ...prev]);
        toast({ 
          title: "Teacher Added", 
          description: "New teacher has been successfully added." 
        });
      }
      setIsDialogOpen(false);
      setEditingTeacher(null);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save teacher", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete teacher");
      setTeachers(prev => prev.filter(t => t.teacher_id !== teacherId));
      toast({ 
        title: "Teacher Deleted", 
        description: "Teacher has been successfully removed." 
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete teacher", 
        variant: "destructive" 
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm định dạng ngày tháng kiểu Việt Nam
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingTeacher(null)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <TeacherDialog 
            teacher={editingTeacher} 
            onSave={handleSaveTeacher}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingTeacher(null);
            }}
          />
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-6">
          <span className="loader"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.teacher_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{teacher.full_name}</CardTitle>
                    <Badge variant={teacher.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-1">
                      {teacher.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTeacher(teacher.teacher_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {teacher.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {teacher.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  {teacher.experience_years} years experience
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Hired Day: {formatDate(teacher.hire_date)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Salary:</span> {Math.round(teacher.salary).toLocaleString('vi-VN')} ₫
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {teacher.qualification}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherDialog = ({ 
  teacher, 
  onSave, 
  onClose 
}: { 
  teacher: Teacher | null;
  onSave: (data: Omit<Teacher, 'teacher_id'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    full_name: teacher?.full_name || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    qualification: teacher?.qualification || "",
    experience_years: teacher?.experience_years || 0,
    salary: teacher?.salary || 0,
    hire_date: teacher?.hire_date || new Date().toISOString().split('T')[0],
    status: teacher?.status || "ACTIVE"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Teacher, 'teacher_id'>);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="qualification">Qualifications</Label>
          <Textarea
            id="qualification"
            value={formData.qualification}
            onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
            placeholder="e.g., PhD in English Literature, TESOL Certified"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience_years">Experience (Years)</Label>
            <Input
              id="experience_years"
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="salary">Salary (VNĐ)</Label>
            <Input
              id="salary"
              type="number"
              step="1000"
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
              min="0"
              placeholder="Salary (VNĐ)"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.salary > 0 ? formData.salary.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : ''}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="hire_date">Hire Date</Label>
          <Input
            id="hire_date"
            type="date"
            value={formData.hire_date}
            onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
          />
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
            {teacher ? 'Update' : 'Add'} Teacher
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default TeachersManager;
