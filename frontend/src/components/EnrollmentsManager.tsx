import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, User, GraduationCap, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  enrollment_date: string;
  fee_paid: number;
  payment_status: string;
  status: string;
}

const EnrollmentsManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch enrollments, students, classes from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/enrollments").then(res => res.json()),
      fetch("http://localhost:5000/api/students").then(res => res.json()),
      fetch("http://localhost:5000/api/classes").then(res => res.json())
    ])
      .then(([enrollmentsData, studentsData, classesData]) => {
        setEnrollments(enrollmentsData);
        setStudents(studentsData);
        setClasses(classesData);
      })
      .catch(() => toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSaveEnrollment = async (enrollmentData: Omit<Enrollment, 'enrollment_id' | 'student_name' | 'class_name'>) => {
    try {
      if (editingEnrollment) {
        // Update enrollment
        const res = await fetch(`http://localhost:5000/api/enrollments/${editingEnrollment.enrollment_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrollmentData)
        });
        if (!res.ok) throw new Error("Failed to update enrollment");
        const updated = await res.json();
        setEnrollments(prev => prev.map(e => e.enrollment_id === updated.enrollment_id ? updated : e));
        toast({ title: "Enrollment Updated", description: "Enrollment information has been successfully updated." });
      } else {
        // Add enrollment
        const res = await fetch("http://localhost:5000/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrollmentData)
        });
        if (!res.ok) throw new Error("Failed to add enrollment");
        const newEnrollment = await res.json();
        setEnrollments(prev => [newEnrollment, ...prev]);
        toast({ title: "Enrollment Added", description: "New enrollment has been successfully added." });
      }
      setIsDialogOpen(false);
      setEditingEnrollment(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save enrollment", variant: "destructive" });
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    if (!window.confirm("Are you sure you want to delete this enrollment?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/enrollments/${enrollmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete enrollment");
      setEnrollments(prev => prev.filter(e => e.enrollment_id !== enrollmentId));
      toast({ title: "Enrollment Deleted", description: "Enrollment has been successfully removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete enrollment", variant: "destructive" });
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingEnrollment(null)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Enrollment
            </Button>
          </DialogTrigger>
          <EnrollmentDialog 
            enrollment={editingEnrollment}
            students={students}
            classes={classes}
            onSave={handleSaveEnrollment}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingEnrollment(null);
            }}
          />
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">Loading enrollments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
              <p className="text-sm text-muted-foreground">No enrollments found.</p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <Card key={enrollment.enrollment_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{enrollment.student_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{enrollment.class_name}</p>
                      <div className="flex gap-2">
                        <Badge className={getPaymentStatusColor(enrollment.payment_status)}>
                          {enrollment.payment_status}
                        </Badge>
                        <Badge variant={enrollment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {enrollment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEnrollment(enrollment);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEnrollment(enrollment.enrollment_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Paid: ${enrollment.fee_paid.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Payment Progress</span>
                      <span className="text-sm font-medium">
                        {enrollment.payment_status === 'PAID' ? '100%' : 
                         enrollment.payment_status === 'PARTIAL' ? '50%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          enrollment.payment_status === 'PAID' ? 'bg-green-600' :
                          enrollment.payment_status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: enrollment.payment_status === 'PAID' ? '100%' : 
                                 enrollment.payment_status === 'PARTIAL' ? '50%' : '0%'
                        }}
                      ></div>
                    </div>
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

const EnrollmentDialog = ({ 
  enrollment, 
  students,
  classes,
  onSave, 
  onClose 
}: { 
  enrollment: Enrollment | null;
  students: any[];
  classes: any[];
  onSave: (data: Omit<Enrollment, 'enrollment_id' | 'student_name' | 'class_name'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    student_id: enrollment?.student_id || 0,
    class_id: enrollment?.class_id || 0,
    enrollment_date: enrollment?.enrollment_date || new Date().toISOString().split('T')[0],
    fee_paid: enrollment?.fee_paid || 0,
    payment_status: enrollment?.payment_status || "PENDING",
    status: enrollment?.status || "ACTIVE"
  });

  const selectedClass = classes.find(c => c.class_id === formData.class_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Enrollment, 'enrollment_id' | 'student_name' | 'class_name'>);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{enrollment ? 'Edit Enrollment' : 'Add New Enrollment'}</DialogTitle>
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
          <Label htmlFor="class_id">Class</Label>
          <Select value={formData.class_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(classItem => (
                <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                  {classItem.class_name} - ${classItem.fee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <Input
            id="enrollment_date"
            type="date"
            value={formData.enrollment_date}
            onChange={(e) => setFormData(prev => ({ ...prev, enrollment_date: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="fee_paid">Fee Paid ($)</Label>
          <Input
            id="fee_paid"
            type="number"
            step="0.01"
            value={formData.fee_paid}
            onChange={(e) => setFormData(prev => ({ ...prev, fee_paid: parseFloat(e.target.value) || 0 }))}
            min="0"
            max={selectedClass?.fee || 1000}
          />
          {selectedClass && (
            <p className="text-sm text-muted-foreground mt-1">
              Total fee: ${selectedClass.fee}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="payment_status">Payment Status</Label>
          <Select value={formData.payment_status} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {enrollment ? 'Update' : 'Add'} Enrollment
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default EnrollmentsManager;
