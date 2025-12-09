// Matches Backend DTOs
export type Role = "STUDENT" | "PROFESSOR" | "ADMIN";

// --- AUTHENTICATION ---
export interface AuthResponse {
    token: string;
    roles: Role[];
    account_id: string;
    profile: any;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

// --- ENROLLMENT (STUDENT VIEW) ---
export interface SectionOfferingResponse {
    section_no: number;
    section_name: string;
    subject_code: string;
    subject_title: string;
    units: number;
    schedule: string;
    status: "OPEN" | "FULL";
}

export interface EnrollmentOfferingResponse {
    term_name: string;
    student_type: string;
    is_block_based: boolean;
    enrollment_status: "DRAFT" | "ENROLLED" | "DROPPED" | "REJECTED" | "NONE";
    remarks: string | null;
    sections: SectionOfferingResponse[];
}

// --- ADMIN DASHBOARD ---
export interface AdminEnrollmentDetailResponse {
    enrollment_no: number;
    student_name: string;
    student_id: string;
    course_code: string;
    term_name: string;
    total_units: number;
    sections: any[];
}

// --- ADMIN SYSTEM CONFIGURATION ---
export interface SystemStatusResponse {
    school_year: string;
    term_name: string;
    status: "OPEN" | "CLOSED";
    enrollment_start: string; // YYYY-MM-DD
    enrollment_end: string;   // YYYY-MM-DD
}

export interface EnrollmentConfigRequest {
    enrollment_start: string;
    enrollment_end: string;
    force_close: boolean;
}

// --- ACADEMIC MANAGEMENT (SUBJECTS) ---
export interface SubjectResponse {
    subject_code: string;
    subject_name: string;
    lec_units: number;
    lab_units: number;
    prerequisite_code?: string | null;
    course_code?: string | null;
}

export interface CreateSubjectRequest {
    subject_code: string;
    subject_name: string;
    lec_units: number;
    lab_units: number;
    prerequisite_code?: string | null;
    course_code?: string | null;
}

export interface UpdateSubjectRequest {
    subject_name: string;
    lec_units: number;
    lab_units: number;
    prerequisite_code?: string | null;
    course_code?: string | null;
}

// --- ACADEMIC MANAGEMENT (COLLEGES) ---
export interface CollegeResponse {
    college_code: string;
    college_name: string;
}

export interface CreateCollegeRequest {
    college_code: string;
    college_name: string;
}

export interface UpdateCollegeRequest {
    college_name: string;
}

// --- ACADEMIC MANAGEMENT (COURSES) ---
export interface CourseResponse {
    course_code: string;
    course_name: string;
    course_tier: "UNDERGRADUATE" | "GRADUATE";
    college_code: string;
}

export interface CreateCourseRequest {
    course_code: string;
    course_name: string;
    course_tier: "UNDERGRADUATE" | "GRADUATE";
    college_code: string;
}

export interface UpdateCourseRequest {
    course_name: string;
    course_tier: "UNDERGRADUATE" | "GRADUATE";
    college_code: string;
}

// --- ACADEMIC MANAGEMENT (BLOCKS) ---
export interface BlockResponse {
    block_no: number;
    course_code: string;
    year_level: number;
    block_number: number;
}

export interface CreateBlockRequest {
    block_no?: number | null; // Optional/Null for create
    course_code: string;
    year_level: number;
    block_number: number;
}

export interface UpdateBlockRequest {
    course_code: string;
    year_level: number;
    block_number: number;
}

// --- USER MANAGEMENT ---

// Response for GET /api/admin/users
export interface UserResponse {
    account_id: string;
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    status: "ACTIVE" | "INACTIVE";
    roles: string[];
    // Student specific
    student_no?: number;
    course_code?: string;
    student_type?: string;
    education_level?: string;
    // Professor specific
    professor_id?: string;
    employee_type?: string;
}

// Request for PUT /api/admin/users/{id}
export interface UpdateUserRequest {
    email?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    status?: "ACTIVE" | "INACTIVE";
}

// --- REGISTRATION REQUESTS ---

export interface RegisterAdminRequest {
    email: string;
    password?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
}

export interface RegisterStudentRequest extends RegisterAdminRequest {
    student_no?: number;        // Optional, generated if null
    education_level: "UNDERGRADUATE" | "GRADUATE";
    student_type: "REGULAR" | "IRREGULAR";
    course_code: string;        // Mandatory for students
    block_no?: number;
}

export interface RegisterProfessorRequest extends RegisterAdminRequest {
    professor_id?: string;      // Optional
    employee_type: "FULL_TIME" | "PART_TIME";
}