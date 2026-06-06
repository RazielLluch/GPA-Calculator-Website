import * as z from "zod";

export const CollegeSchema = z.object({
  id: crypto.randomUUID(),
  code: z.string().max(15, {message: "College Code is too long"}),
  name: z.string(),
})

export const ProgramSchema = z.object({
  id: crypto.randomUUID(),
  code: z.string().max(15, {message: "Program Code is too long"}),
  name: z.string(),
  department: CollegeSchema,
})

export const StudentSchema = z.object({
  id: crypto.randomUUID(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  program: ProgramSchema,
  year: z.number().min(1),
  prevGPA: z.float32().min(1.0, {message: "Previous GPA cannot be less than 1.0"}),
  cGPA: z.float32().min(1.0, {message: "Cumulative GPA cannot be less than 1.0"})
})

export const GradeSchema = z.enum([
  "1.0",
  "1.25",
  "1.5",
  "1.75",
  "2.0",
  "2.25",
  "2.5",
  "2.75",
  "3.0",
  "5.0",
  "INC",
  "P",
  "F",
  "In Progress",
]);

export const CourseSchema = z.object({
  id: crypto.randomUUID(),
  code: z.string().max(15, {
    message: "Course Code is too long",
  }),
  name: z.string(),
  units: z.number().min(1, {
    message: "Course units cannot be less than 1",
  }),
  grade: GradeSchema.nullable(),
});

export const SemesterSchema = z.object({
  id: z.string().uuid(),
  term: z.enum(["1", "2", "Summer"]),   // adjust to your school's terms
  schoolYear: z.string().regex(/^\d{4}-\d{4}$/, "Use format 2025-2026"),
  courses: z.array(CourseSchema),
});

export type Semester = z.infer<typeof SemesterSchema>;
export type College = z.infer<typeof CollegeSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Program = z.infer<typeof ProgramSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Grade = z.infer<typeof GradeSchema>;

const gradePointMap: Partial<Record<Grade, number>> = {
  "1.0": 1.0,
  "1.25": 1.25,
  "1.5": 1.5,
  "1.75": 1.75,
  "2.0": 2.0,
  "2.25": 2.25,
  "2.5": 2.5,
  "2.75": 2.75,
  "3.0": 3.0,
  "5.0": 5.0,
  
  // INC counts as 5.0 until complied
  "INC": 5.0,
  
  // No GPA equivalent
  "P": undefined,
  "F": undefined,
  "In Progress": undefined,
};

export function getGradePoint(grade: Grade | null): number | null {
  if (grade === null) return null;
  return gradePointMap[grade] ?? null;
}

export function isIncludedInGPA(grade: Grade | null): boolean {
  return getGradePoint(grade) !== null;
}
