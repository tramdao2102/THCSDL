const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Students API
  async getStudents() {
    return this.request('/students');
  }

  async getStudentById(id: number) {
    return this.request(`/students/${id}`);
  }

  async createStudent(data: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: number, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: number) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async searchStudents(query: string) {
    return this.request(`/students/search?q=${encodeURIComponent(query)}`);
  }

  // Teachers API
  async getTeachers() {
    return this.request('/teachers');
  }

  async getTeacherById(id: number) {
    return this.request(`/teachers/${id}`);
  }

  async createTeacher(data: any) {
    return this.request('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id: number, data: any) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id: number) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  async searchTeachers(query: string) {
    return this.request(`/teachers/search?q=${encodeURIComponent(query)}`);
  }

  // Courses API
  async getCourses() {
    return this.request('/courses');
  }

  async getCourseById(id: number) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(data: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: number, data: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: number) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCourses(query: string) {
    return this.request(`/courses/search?q=${encodeURIComponent(query)}`);
  }

  // Classes API
  async getClasses() {
    return this.request('/classes');
  }

  async getClassById(id: number) {
    return this.request(`/classes/${id}`);
  }

  async createClass(data: any) {
    return this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClass(id: number, data: any) {
    return this.request(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClass(id: number) {
    return this.request(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  async searchClasses(query: string) {
    return this.request(`/classes/search?q=${encodeURIComponent(query)}`);
  }

  async updateClassStudentCount(id: number) {
    return this.request(`/classes/${id}/update-student-count`, {
      method: 'PUT',
    });
  }

  // Enrollments API
  async getEnrollments() {
    return this.request('/enrollments');
  }

  async getEnrollmentById(id: number) {
    return this.request(`/enrollments/${id}`);
  }

  async createEnrollment(data: any) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEnrollment(id: number, data: any) {
    return this.request(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEnrollment(id: number) {
    return this.request(`/enrollments/${id}`, {
      method: 'DELETE',
    });
  }

  async searchEnrollments(query: string) {
    return this.request(`/enrollments/search?q=${encodeURIComponent(query)}`);
  }

  async getEnrollmentsByStudent(studentId: number) {
    return this.request(`/enrollments/student/${studentId}`);
  }

  async getEnrollmentsByClass(classId: number) {
    return this.request(`/enrollments/class/${classId}`);
  }

  // Tests API
  async getTests() {
    return this.request('/tests');
  }

  async getTestById(id: number) {
    return this.request(`/tests/${id}`);
  }

  async createTest(data: any) {
    return this.request('/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTest(id: number, data: any) {
    return this.request(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(id: number) {
    return this.request(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async searchTests(query: string) {
    return this.request(`/tests/search?q=${encodeURIComponent(query)}`);
  }

  // Scores API
  async getScores() {
    return this.request('/scores');
  }

  async getScoreById(id: number) {
    return this.request(`/scores/${id}`);
  }

  async createScore(data: any) {
    return this.request('/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScore(id: number, data: any) {
    return this.request(`/scores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteScore(id: number) {
    return this.request(`/scores/${id}`, {
      method: 'DELETE',
    });
  }

  async searchScores(query: string) {
    return this.request(`/scores/search?q=${encodeURIComponent(query)}`);
  }

  async getScoresByStudent(studentId: number) {
    return this.request(`/scores/student/${studentId}`);
  }

  async getScoresByTest(testId: number) {
    return this.request(`/scores/test/${testId}`);
  }

  async getScoreStatistics() {
    return this.request('/scores/statistics');
  }

  // Attendance API
  async getAttendance(sessionId?: number) {
    const queryParam = sessionId ? `?session_id=${sessionId}` : '';
    return this.request(`/attendance${queryParam}`);
  }

  async getAttendanceById(id: number) {
    return this.request(`/attendance/${id}`);
  }

  async createAttendance(data: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAttendance(id: number, data: any) {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendance(id: number) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  async getAttendanceBySession(sessionId: number) {
    return this.request(`/attendance/session/${sessionId}`);
  }

  async getAttendanceByStudent(studentId: number) {
    return this.request(`/attendance/student/${studentId}`);
  }

  async bulkCreateOrUpdateAttendance(data: any[]) {
    return this.request('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceSummary(studentId?: number, classId?: number) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId.toString());
    if (classId) params.append('class_id', classId.toString());
    const queryParam = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/attendance/summary${queryParam}`);
  }

  async updateAttendanceSummary(studentId: number, classId: number) {
    return this.request(`/attendance/summary/${studentId}/${classId}`, {
      method: 'PUT',
    });
  }

  // Sessions API
  async getSessions() {
    return this.request('/sessions');
  }

  async getSessionById(id: number) {
    return this.request(`/sessions/${id}`);
  }

  async createSession(data: any) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: number, data: any) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: number) {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async getSessionsByClass(classId: number) {
    return this.request(`/sessions/class/${classId}`);
  }

  async searchSessions(query: string) {
    return this.request(`/sessions/search?q=${encodeURIComponent(query)}`);
  }

   // Payments API
  async getPayments() {
    return this.request('/payments');
  }

  async getPaymentById(id: number) {
    return this.request(`/payments/${id}`);
  }

  async createPayment(data: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: number, data: any) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: number) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPayments(query: string) {
    return this.request(`/payments/search?q=${encodeURIComponent(query)}`);
  }

  async getPaymentsByStudent(studentId: number) {
    return this.request(`/payments/student/${studentId}`);
  }

  async getPaymentSummary() {
    return this.request('/payments/summary');
  }

  async getPaymentStudents() {
    return this.request('/payments/data/students');
  }

  async getPaymentEnrollments() {
    return this.request('/payments/data/enrollments');
  }

  // Health check
  async healthCheck() {
    return fetch(`${this.baseUrl.replace('/api', '')}/health`)
      .then(res => res.json());
  }
}

export const apiService = new ApiService();
export default apiService;