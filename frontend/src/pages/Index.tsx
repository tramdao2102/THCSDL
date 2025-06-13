
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, DollarSign, CalendarCheck, Wallet } from "lucide-react";
import StudentsManager from "@/components/StudentsManager";
import TeachersManager from "@/components/TeachersManager";
import CoursesManager from "@/components/CoursesManager";
import ClassesManager from "@/components/ClassesManager";
import EnrollmentsManager from "@/components/EnrollmentsManager";
import ScoresManager from "@/components/ScoresManager";
import AttendanceManager from "@/components/AttendanceManager";
import PaymentManager from "@/components/PaymentManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    {
      title: "Total Students",
      value: "234",
      icon: Users,
      change: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Active Teachers",
      value: "18",
      icon: GraduationCap,
      change: "+2",
      color: "text-green-600"
    },
    {
      title: "Running Courses",
      value: "12",
      icon: BookOpen,
      change: "+3",
      color: "text-purple-600"
    },
    {
      title: "Active Classes",
      value: "25",
      icon: Calendar,
      change: "+5",
      color: "text-orange-600"
    },
    {
      title: "Monthly Revenue",
      value: "$15,420",
      icon: DollarSign,
      change: "+18%",
      color: "text-emerald-600"
    },
    {
      title: "Average Score",
      value: "8.2",
      icon: TrendingUp,
      change: "+0.3",
      color: "text-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            English Center Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive management system for your English learning center
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-8 overflow-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="scores" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Scores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Student Name {item}</p>
                          <p className="text-sm text-muted-foreground">Enrolled in Advanced English</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$120</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Upcoming Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Class {item}</p>
                          <p className="text-sm text-muted-foreground">Teacher Name</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Room A{item}</p>
                          <p className="text-xs text-muted-foreground">10:00 AM</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <StudentsManager />
          </TabsContent>

          <TabsContent value="teachers">
            <TeachersManager />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesManager />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesManager />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManager />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManager />
          </TabsContent>

          <TabsContent value="scores">
            <ScoresManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;