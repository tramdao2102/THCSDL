import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Plus, Search, Edit, Trash2, User, CalendarCheck, CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  session_id: number;
  class_id: number;
  class_name: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  topic: string;
  description?: string;
  teacher_id: number;
  teacher_name: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

interface Attendance {
  attendance_id: number;
  session_id: number;
  student_id: number;
  student_name: string;
  attendance_status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}

interface AttendanceSummary {
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
}

const AttendanceManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'sessions' | 'attendance' | 'summary'>('sessions');
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<Session | null>(null);

  // Dữ liệu thực từ backend thay cho mock data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data từ backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/sessions").then(res => res.json()),
      fetch("http://localhost:5000/api/attendances").then(res => res.json()),
      fetch("http://localhost:5000/api/attendances/summary").then(res => res.json()),
      fetch("http://localhost:5000/api/classes").then(res => res.json()),
      fetch("http://localhost:5000/api/teachers").then(res => res.json()),
      fetch("http://localhost:5000/api/students").then(res => res.json())
    ])
      .then(([sessionsData, attendanceData, summaryData, classesData, teachersData, studentsData]) => {
        setSessions(sessionsData);
        setAttendanceRecords(attendanceData);
        setAttendanceSummaries(summaryData);
        setClasses(classesData);
        setTeachers(teachersData);
        setStudents(studentsData);
      })
      .catch(() => toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSaveSession = async (sessionData: Omit<Session, 'session_id' | 'class_name' | 'teacher_name'>) => {
    try {
      if (selectedSession) {
        // Update session
        const res = await fetch(`http://localhost:5000/api/sessions/${selectedSession.session_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData)
        });
        if (!res.ok) throw new Error("Failed to update session");
        const updated = await res.json();
        setSessions(prev => prev.map(s => s.session_id === updated.session_id ? updated : s));
        toast({ title: "Session Updated", description: "Session information has been successfully updated." });
      } else {
        // Add session
        const res = await fetch("http://localhost:5000/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData)
        });
        if (!res.ok) throw new Error("Failed to add session");
        const newSession = await res.json();
        setSessions(prev => [...prev, newSession]);
        toast({ title: "Session Added", description: "New session has been successfully added." });
      }
      setIsSessionDialogOpen(false);
      setSelectedSession(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save session", variant: "destructive" });
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete session");
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      toast({ title: "Session Deleted", description: "Session has been successfully removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete session", variant: "destructive" });
    }
  };

  const handleSaveAttendance = async (attendanceData: Attendance[]) => {
    try {
      // Gửi toàn bộ danh sách điểm danh cho 1 session
      const res = await fetch("http://localhost:5000/api/attendances/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
      });
      if (!res.ok) throw new Error("Failed to save attendance");
      // Cập nhật lại attendanceRecords từ backend
      const updated = await res.json();
      setAttendanceRecords(prev => {
        const sessionId = attendanceData[0]?.session_id;
        const filtered = prev.filter(a => a.session_id !== sessionId);
        return [...filtered, ...updated];
      });
      toast({ title: "Attendance Saved", description: "Attendance records have been successfully updated." });
      setIsAttendanceDialogOpen(false);
      setSelectedSessionForAttendance(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save attendance", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendanceSummaries = attendanceSummaries.filter(summary =>
    summary.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.class_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder={activeTab === 'sessions' ? "Search sessions..." : "Search students..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'sessions' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('sessions')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Sessions
          </Button>
          <Button 
            variant={activeTab === 'attendance' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarCheck className="h-4 w-4 mr-2" />
            Take Attendance
          </Button>
          <Button 
            variant={activeTab === 'summary' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('summary')}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Summary
          </Button>
        </div>
        
        {activeTab === 'sessions' && (
          <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setSelectedSession(null)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <SessionDialog 
              session={selectedSession}
              classes={classes}
              teachers={teachers}
              onSave={handleSaveSession}
              onClose={() => {
                setIsSessionDialogOpen(false);
                setSelectedSession(null);
              }}
            />
          </Dialog>
        )}
      </div>

      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.session_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{session.topic}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{session.class_name}</p>
                    <Badge className={`mt-2 ${getStatusColor(session.status)}`}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSession(session);
                        setIsSessionDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSession(session.session_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Ngày: {formatDate(session.session_date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Time: {session.session_time.substring(0, 5)} ({session.duration_minutes} min)</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-purple-600" />
                  <span>Teacher: {session.teacher_name}</span>
                </div>
                
                {session.description && (
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    {session.description}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Take Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Session</Label>
                  <Select onValueChange={(value) => {
                    const session = sessions.find(s => s.session_id === parseInt(value));
                    if (session) {
                      setSelectedSessionForAttendance(session);
                      setIsAttendanceDialogOpen(true);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a session to take attendance" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map(session => (
                        <SelectItem key={session.session_id} value={session.session_id.toString()}>
                          {session.class_name} - {session.topic} ({formatDate(session.session_date)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.session_id}>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>{formatDate(session.session_date)}</TableCell>
                        <TableCell>{session.class_name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSessionForAttendance(session);
                              setIsAttendanceDialogOpen(true);
                            }}
                          >
                            Take Attendance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
            <AttendanceDialog
              session={selectedSessionForAttendance}
              students={students}
              attendanceRecords={attendanceRecords.filter(record => 
                record.session_id === selectedSessionForAttendance?.session_id
              )}
              onSave={handleSaveAttendance}
              onClose={() => {
                setIsAttendanceDialogOpen(false);
                setSelectedSessionForAttendance(null);
              }}
            />
          </Dialog>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Excused</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceSummaries.map((summary) => (
                    <TableRow key={`${summary.student_id}-${summary.class_id}`}>
                      <TableCell>{summary.student_name}</TableCell>
                      <TableCell>{summary.class_name}</TableCell>
                      <TableCell>{summary.present_count}</TableCell>
                      <TableCell>{summary.absent_count}</TableCell>
                      <TableCell>{summary.late_count}</TableCell>
                      <TableCell>{summary.excused_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${summary.attendance_rate}%` }}
                            ></div>
                          </div>
                          <span>{summary.attendance_rate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const SessionDialog = ({ 
  session, 
  classes,
  teachers,
  onSave, 
  onClose 
}: { 
  session: Session | null;
  classes: any[];
  teachers: any[];
  onSave: (data: Omit<Session, 'session_id' | 'class_name' | 'teacher_name'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    class_id: session?.class_id || 0,
    session_date: session?.session_date || new Date().toISOString().split('T')[0],
    session_time: session?.session_time || '10:00:00',
    duration_minutes: session?.duration_minutes || 90,
    topic: session?.topic || '',
    description: session?.description || '',
    teacher_id: session?.teacher_id || 0,
    status: session?.status || 'SCHEDULED'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Session, 'session_id' | 'class_name' | 'teacher_name'>);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{session ? 'Edit Session' : 'Add New Session'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="class_id">Class</Label>
          <Select 
            value={formData.class_id.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(classItem => (
                <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                  {classItem.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="teacher_id">Teacher</Label>
          <Select 
            value={formData.teacher_id.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, teacher_id: parseInt(value) }))}
          >
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
            <Label htmlFor="session_date">Date</Label>
            <Input
              id="session_date"
              type="date"
              value={formData.session_date}
              onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="session_time">Time</Label>
            <Input
              id="session_time"
              type="time"
              value={formData.session_time.substring(0, 5)}
              onChange={(e) => setFormData(prev => ({ ...prev, session_time: e.target.value + ':00' }))}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
            required
            min="15"
            step="15"
          />
        </div>
        
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              status: value as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {session ? 'Update' : 'Add'} Session
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

const AttendanceDialog = ({
  session,
  students,
  attendanceRecords,
  onSave,
  onClose
}: {
  session: Session | null;
  students: any[];
  attendanceRecords: Attendance[];
  onSave: (data: Attendance[]) => void;
  onClose: () => void;
}) => {
  const [records, setRecords] = useState<Attendance[]>(() => {
    // Initialize with existing records or create new ones for all students
    if (attendanceRecords.length) {
      return attendanceRecords;
    } else {
      return students.map(student => ({
        attendance_id: 0, // New record, will be generated on save
        session_id: session?.session_id || 0,
        student_id: student.student_id,
        student_name: student.full_name,
        attendance_status: 'PRESENT',
        check_in_time: session ? `${session.session_date}T${session.session_time}` : undefined,
        check_out_time: undefined,
        notes: ''
      }));
    }
  });

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRecords(prev => prev.map(record => 
      record.student_id === studentId 
        ? { ...record, attendance_status: status }
        : record
    ));
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setRecords(prev => prev.map(record => 
      record.student_id === studentId 
        ? { ...record, notes }
        : record
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(records);
  };

  // Thêm hàm formatDate vào AttendanceDialog nếu cần dùng
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!session) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Điểm danh cho {session.class_name} - {session.topic}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          {formatDate(session.session_date)} lúc {session.session_time.substring(0, 5)}
        </p>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.student_id}>
                <TableCell>{record.student_name}</TableCell>
                <TableCell>
                  <Select 
                    value={record.attendance_status} 
                    onValueChange={(value) => handleStatusChange(
                      record.student_id, 
                      value as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
                    )}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="LATE">Late</SelectItem>
                      <SelectItem value="EXCUSED">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Optional notes"
                    value={record.notes || ''}
                    onChange={(e) => handleNotesChange(record.student_id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Attendance
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default AttendanceManager;