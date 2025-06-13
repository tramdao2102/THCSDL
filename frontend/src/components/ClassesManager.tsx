import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Class {
  class_id: number;
  class_name: string;
  course_id: number;
  course_name: string;
  teacher_id: number;
  teacher_name: string;
  start_date: string;
  end_date: string;
  schedule: string;
  room: string;
  current_students: number;
  max_students: number;
  status: string;
}

const ClassesManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch classes, courses, teachers from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/classes").then(res => res.json()),
      fetch("http://localhost:5000/api/courses").then(res => res.json()),
      fetch("http://localhost:5000/api/teachers").then(res => res.json())
    ])
      .then(([classesData, coursesData, teachersData]) => {
        setClasses(classesData);
        setCourses(coursesData);
        setTeachers(teachersData);
      })
      .catch(() => toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSaveClass = async (classData: Omit<Class, 'class_id' | 'course_name' | 'teacher_name'>) => {
    try {
      if (editingClass) {
        // Update class
        const res = await fetch(`http://localhost:5000/api/classes/${editingClass.class_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classData)
        });
        if (!res.ok) throw new Error("Failed to update class");
        const updated = await res.json();
        setClasses(prev => prev.map(c => c.class_id === updated.class_id ? updated : c));
        toast({ title: "Class Updated", description: "Class information has been successfully updated." });
      } else {
        // Add class
        const res = await fetch("http://localhost:5000/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classData)
        });
        if (!res.ok) throw new Error("Failed to add class");
        const newClass = await res.json();
        setClasses(prev => [newClass, ...prev]);
        toast({ title: "Class Added", description: "New class has been successfully added." });
      }
      setIsDialogOpen(false);
      setEditingClass(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save class", variant: "destructive" });
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${classId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete class");
      setClasses(prev => prev.filter(c => c.class_id !== classId));
      toast({ title: "Class Deleted", description: "Class has been successfully removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete class", variant: "destructive" });
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm định dạng ngày tháng kiểu Việt Nam giống PaymentManager
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingClass(null)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <ClassDialog 
            classData={editingClass} 
            courses={courses}
            teachers={teachers}
            onSave={handleSaveClass}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingClass(null);
            }}
          />
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="loader"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => {
            // Tìm max_students từ course tương ứng
            const course = courses.find(c => c.course_id === classItem.course_id);
            const maxStudents = course ? course.max_students : classItem.max_students;

            return (
              <Card key={classItem.class_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{classItem.class_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{classItem.course_name}</p>
                      <Badge variant={classItem.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {classItem.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingClass(classItem);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClass(classItem.class_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{classItem.teacher_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Room {classItem.room}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {classItem.schedule}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(classItem.start_date)} - {formatDate(classItem.end_date)}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        {classItem.current_students}/{maxStudents} students
                      </span>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(classItem.current_students / (maxStudents || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ClassDialog = ({ 
  classData, 
  courses,
  teachers,
  onSave, 
  onClose 
}: { 
  classData: Class | null;
  courses: any[];
  teachers: any[];
  onSave: (data: Omit<Class, 'class_id' | 'course_name' | 'teacher_name'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    class_name: classData?.class_name || "",
    course_id: classData?.course_id || 0,
    teacher_id: classData?.teacher_id || 0,
    start_date: classData?.start_date || "",
    end_date: classData?.end_date || "",
    schedule: classData?.schedule || "",
    room: classData?.room || "",
    current_students: classData?.current_students || 0,
    status: classData?.status || "ACTIVE"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Class, 'class_id' | 'course_name' | 'teacher_name'>);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{classData ? 'Edit Class' : 'Add New Class'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="class_name">Class Name</Label>
          <Input
            id="class_name"
            value={formData.class_name}
            onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="course_id">Course</Label>
          <Select value={formData.course_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.course_id} value={course.course_id.toString()}>
                  {course.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="teacher_id">Teacher</Label>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="schedule">Schedule</Label>
          <Input
            id="schedule"
            value={formData.schedule}
            onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
            placeholder="e.g., Mon, Wed, Fri - 9:00 AM"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
              placeholder="e.g., A101"
            />
          </div>
          
          <div>
            <Label htmlFor="current_students">Current Students</Label>
            <Input
              id="current_students"
              type="number"
              value={formData.current_students}
              onChange={(e) => setFormData(prev => ({ ...prev, current_students: parseInt(e.target.value) || 0 }))}
              min="0"
            />
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
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {classData ? 'Update' : 'Add'} Class
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default ClassesManager;
