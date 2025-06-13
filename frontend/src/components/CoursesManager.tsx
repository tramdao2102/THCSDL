import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, BookOpen, Clock, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  course_id: number;
  course_name: string;
  description: string;
  level: string;
  duration_weeks: number;
  fee: number;
  max_students: number;
  status: string;
}

const CoursesManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch courses from backend
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/courses")
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSaveCourse = async (courseData: Omit<Course, 'course_id'>) => {
    try {
      if (editingCourse) {
        // Update course
        const res = await fetch(`http://localhost:5000/api/courses/${editingCourse.course_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData)
        });
        if (!res.ok) throw new Error("Failed to update course");
        const updated = await res.json();
        setCourses(prev => prev.map(c => c.course_id === updated.course_id ? updated : c));
        toast({ title: "Course Updated", description: "Course information has been successfully updated." });
      } else {
        // Add course
        const res = await fetch("http://localhost:5000/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData)
        });
        if (!res.ok) throw new Error("Failed to add course");
        const newCourse = await res.json();
        setCourses(prev => [newCourse, ...prev]);
        toast({ title: "Course Added", description: "New course has been successfully added." });
      }
      setIsDialogOpen(false);
      setEditingCourse(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save course", variant: "destructive" });
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      setCourses(prev => prev.filter(c => c.course_id !== courseId));
      toast({ title: "Course Deleted", description: "Course has been successfully removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete course", variant: "destructive" });
    }
  };

  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingCourse(null)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <CourseDialog 
            course={editingCourse} 
            onSave={handleSaveCourse}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingCourse(null);
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
          {filteredCourses.map((course) => (
            <Card key={course.course_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.course_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <Badge variant={course.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCourse(course);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCourse(course.course_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{course.duration_weeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Max {course.max_students}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-lg">
                      {Math.round(course.fee).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const CourseDialog = ({ 
  course, 
  onSave, 
  onClose 
}: { 
  course: Course | null;
  onSave: (data: Omit<Course, 'course_id'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    course_name: course?.course_name || "",
    description: course?.description || "",
    level: course?.level || "BEGINNER",
    duration_weeks: course?.duration_weeks || 0,
    fee: course?.fee || 0,
    max_students: course?.max_students || 20,
    status: course?.status || "ACTIVE"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Course, 'course_id'>);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="course_name">Course Name</Label>
          <Input
            id="course_name"
            value={formData.course_name}
            onChange={(e) => setFormData(prev => ({ ...prev, course_name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Course description and objectives"
          />
        </div>
        
        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration_weeks">Duration (Weeks)</Label>
            <Input
              id="duration_weeks"
              type="number"
              value={formData.duration_weeks}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || 0 }))}
              min="1"
            />
          </div>
          
          <div>
            <Label htmlFor="max_students">Max Students</Label>
            <Input
              id="max_students"
              type="number"
              value={formData.max_students}
              onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 0 }))}
              min="1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="fee">Course Fee (VNĐ)</Label>
          <Input
            id="fee"
            type="number"
            step="1000"
            value={formData.fee}
            onChange={(e) => setFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
            min="0"
            placeholder="Course Fee (VNĐ)"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {formData.fee > 0 ? Math.round(formData.fee).toLocaleString('vi-VN') + ' ₫' : ''}
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
            {course ? 'Update' : 'Add'} Course
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default CoursesManager;
