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
import { Calendar, DollarSign, Plus, Search, Edit, Trash2, Wallet, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  payment_id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  description?: string;
  status: string;
  created_date?: string;
}

interface Student {
  student_id: number;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
}

interface Enrollment {
  enrollment_id: number;
  student_id: number;
  class_id: number;
  class_name: string;
  enrollment_date: string;
  fee_paid: number;
  payment_status: string;
  status: string;
}

interface PaymentSummary {
  student_id: number;
  student_name: string;
  total_payments: number;
  total_amount: number;
  last_payment_date: string;
  payment_status: string;
}

const PaymentManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all required data in parallel
        const [paymentsRes, studentsRes, enrollmentsRes] = await Promise.all([
          fetch("http://localhost:5000/api/payments"),
          fetch("http://localhost:5000/api/students"), 
          fetch("http://localhost:5000/api/enrollments")
        ]);

        if (!paymentsRes.ok || !studentsRes.ok || !enrollmentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [paymentsData, studentsData, enrollmentsData] = await Promise.all([
          paymentsRes.json(),
          studentsRes.json(),
          enrollmentsRes.json()
        ]);

        setPayments(paymentsData || []);
        setStudents(studentsData || []);
        setEnrollments(enrollmentsData || []);

        console.log('Data loaded successfully:', {
          payments: paymentsData?.length || 0,
          students: studentsData?.length || 0,
          enrollments: enrollmentsData?.length || 0
        });

      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({ 
          title: "Error", 
          description: "Failed to load data. Please check your connection and try again.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSavePayment = async (paymentData: Omit<Payment, 'payment_id'>) => {
    try {
      if (editingPayment) {
        const res = await fetch(`http://localhost:5000/api/payments/${editingPayment.payment_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData)
        });
        if (!res.ok) throw new Error("Failed to update payment");
        const savedPayment = await res.json();
        setPayments(prev => prev.map(p =>
          p.payment_id === savedPayment.payment_id ? savedPayment : p
        ));
        toast({
          title: "Payment Updated",
          description: "Payment information has been successfully updated."
        });
      } else {
        const res = await fetch("http://localhost:5000/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData)
        });
        if (!res.ok) throw new Error("Failed to create payment");
        const savedPayment = await res.json();
        setPayments(prev => [savedPayment, ...prev]);
        toast({
          title: "Payment Added",
          description: "New payment has been successfully recorded."
        });
      }
      setIsDialogOpen(false);
      setEditingPayment(null);
    } catch (error: any) {
      console.error('Error saving payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payment",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/payments/${paymentId}`, { 
        method: "DELETE" 
      });

      if (!res.ok) throw new Error("Failed to delete payment");
      
      setPayments(prev => prev.filter(p => p.payment_id !== paymentId));
      
      toast({
        title: "Payment Deleted",
        description: "Payment record has been successfully removed."
      });
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive"
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const studentName = students.find(s => s.student_id === payment.student_id)?.full_name || '';
    const className = enrollments.find(e => e.student_id === payment.student_id)?.class_name || '';
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Generate payment summaries by student
  const paymentSummaries = students.map(student => {
    const studentPayments = payments.filter(p => p.student_id === student.student_id);
    const totalAmount = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const lastPayment = studentPayments.sort((a, b) =>
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    )[0];

    return {
      student_id: student.student_id,
      student_name: student.full_name,
      total_payments: studentPayments.length,
      total_amount: totalAmount,
      last_payment_date: lastPayment?.payment_date || 'N/A',
      payment_status: totalAmount > 0 ? 'ACTIVE' : 'INACTIVE'
    };
  });

  const filteredSummaries = paymentSummaries.filter(summary =>
    summary.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'CASH': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'BANK_TRANSFER': return <Wallet className="h-4 w-4 text-blue-600" />;
      case 'CARD': return <CreditCard className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-muted-foreground">Loading payment data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Payment History
          </Button>
          <Button 
            variant={viewMode === 'summary' ? 'default' : 'outline'} 
            onClick={() => setViewMode('summary')}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Student Summary
          </Button>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingPayment(null)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <PaymentDialog 
            payment={editingPayment}
            students={students}
            enrollments={enrollments}
            onSave={handleSavePayment}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingPayment(null);
            }}
          />
        </Dialog>
      </div>

      {viewMode === 'list' && (
        <>
          {/* Desktop view for larger screens */}
          <div className="hidden md:block">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Payment History ({filteredPayments.length} records)</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">No payments found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.payment_id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell className="font-medium">
                            {students.find(s => s.student_id === payment.student_id)?.full_name || ''}
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(payment.payment_method)}
                              {payment.payment_method.replace('_', ' ')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {enrollments.find(e => e.student_id === payment.student_id)?.class_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingPayment(payment);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePayment(payment.payment_id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Mobile view for smaller screens */}
          <div className="md:hidden">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No payments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredPayments.map((payment) => (
                  <Card key={payment.payment_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {students.find(s => s.student_id === payment.student_id)?.full_name || ''}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(payment.payment_date)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            <Badge variant="outline">
                              <div className="flex items-center gap-1">
                                {getPaymentMethodIcon(payment.payment_method)}
                                {payment.payment_method.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {enrollments.find(e => e.student_id === payment.student_id)?.class_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>
                            Class: {enrollments.find(e => e.student_id === payment.student_id)?.class_name}
                          </span>
                        </div>
                      )}

                      {payment.description && (
                        <div className="text-sm text-muted-foreground">
                          {payment.description}
                        </div>
                      )}
                      
                      {payment.transaction_id && (
                        <div className="text-xs text-muted-foreground">
                          Transaction ID: {payment.transaction_id}
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPayment(payment);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePayment(payment.payment_id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'summary' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Student Payment Summary ({filteredSummaries.length} students)</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSummaries.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No student summaries found</p>
              </div>
            ) : (
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Total Payments</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSummaries.map((summary) => (
                      <TableRow key={summary.student_id}>
                        <TableCell className="font-medium">{summary.student_name}</TableCell>
                        <TableCell>{summary.total_payments}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(summary.total_amount)}</TableCell>
                        <TableCell>
                          {summary.last_payment_date !== 'N/A' 
                            ? formatDate(summary.last_payment_date)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={summary.payment_status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {summary.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setViewMode('list');
                              setSearchTerm(summary.student_name);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Mobile view for summary */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredSummaries.map((summary) => (
                <Card key={summary.student_id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{summary.student_name}</h3>
                      <Badge variant={summary.payment_status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {summary.payment_status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Total Payments: {summary.total_payments}</div>
                      <div>Total Amount: {formatCurrency(summary.total_amount)}</div>
                      <div>Last Payment: {summary.last_payment_date !== 'N/A' ? formatDate(summary.last_payment_date) : 'N/A'}</div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setViewMode('list');
                        setSearchTerm(summary.student_name);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const PaymentDialog = ({ 
  payment, 
  students,
  enrollments,
  onSave, 
  onClose 
}: { 
  payment: Payment | null;
  students: Student[];
  enrollments: Enrollment[];
  onSave: (data: Omit<Payment, 'payment_id'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    student_id: payment?.student_id || 0,
    amount: payment?.amount || 0,
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    payment_method: payment?.payment_method || 'CASH',
    transaction_id: payment?.transaction_id || '',
    description: payment?.description || '',
    status: payment?.status || 'COMPLETED'
  });

  // Filter enrollments based on selected student
  const studentEnrollments = enrollments.filter(enrollment => 
    enrollment.student_id === formData.student_id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || formData.student_id === 0) {
      alert('Please select a student');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!formData.payment_date.trim()) {
      alert('Please select a payment date');
      return;
    }
    // Gửi đúng các trường của bảng payments
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{payment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="student_id">Student *</Label>
          <Select 
            value={formData.student_id ? formData.student_id.toString() : ''} 
            onValueChange={(value) => {
              const studentId = parseInt(value);
              setFormData(prev => ({ 
                ...prev, 
                student_id: studentId
              }));
            }}
          >
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
        
        {/* Hiển thị enrollments nếu muốn, không lưu vào formData */}
        <div>
          <Label>Class Enrollment</Label>
          <div className="text-muted-foreground text-sm">
            {studentEnrollments.length > 0
              ? studentEnrollments.map(e => e.class_name).join(', ')
              : 'No enrollments found'}
          </div>
        </div>
        
        <div>
          <Label htmlFor="amount">Amount (VND) *</Label>
          <Input
            id="amount"
            type="number"
            step="1000"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
            }
            required
            placeholder="Enter amount in VND"
          />
        </div>
        
        <div>
          <Label htmlFor="payment_date">Payment Date *</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="payment_method">Payment Method *</Label>
          <Select 
            value={formData.payment_method} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.payment_method !== 'CASH' && (
          <div>
            <Label htmlFor="transaction_id">Transaction ID</Label>
            <Input
              id="transaction_id"
              value={formData.transaction_id}
              onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
              placeholder="Enter transaction reference"
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Add payment notes (optional)"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {payment ? 'Update' : 'Record'} Payment
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default PaymentManager;