import {Course, Semester, getGradePoint, isIncludedInGPA, Grade} from "@/schemas/schemas";
"@/schemas/schemas"

export interface GpaResult {
    gpa: number | null;
    unitsEarned: number;
    unitsAttempted: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateGPA(courses: Course[]): GpaResult {
  let weighted = 0;
  let gpaUnits = 0;
  let attempted = 0;

  for (const c of courses) {
    attempted += c.units;
    const point = getGradePoint(c.grade);
    if (point !== null) {
      weighted += point * c.units;
      gpaUnits += c.units;
    }
  }

  return {
    gpa: gpaUnits > 0 ? round2(weighted / gpaUnits) : null,
    unitsEarned: gpaUnits,
    unitsAttempted: attempted,
  };
}

export function calculateSemesterGPA(sem: Semester): GpaResult {
  return calculateGPA(sem.courses);
}

export function calculateCumulativeGPA(semesters: Semester[]): GpaResult {
  return calculateGPA(semesters.flatMap((s) => s.courses));
}

export interface AcademicStats {
  cumulative: GpaResult;
  highestSemesterGPA: number | null;  // best = LOWEST number on PH scale
  lowestSemesterGPA: number | null;
  totalUnitsEarned: number;
  totalUnitsAttempted: number;
  gradeDistribution: Record<Grade, number>;
  semesterTrend: { label: string; gpa: number | null }[];
}

export function calculateStats(semesters: Semester[]): AcademicStats {
  const perSem = semesters.map((s) => ({
    label: `${s.term} ${s.schoolYear}`,
    result: calculateSemesterGPA(s),
  }));

  const gpas = perSem
    .map((p) => p.result.gpa)
    .filter((g): g is number => g !== null);

  // PH scale: lower is better → "highest" achievement = Math.min
  const highest = gpas.length ? Math.min(...gpas) : null;
  const lowest = gpas.length ? Math.max(...gpas) : null;

  const distribution = {} as Record<Grade, number>;
  for (const s of semesters)
    for (const c of s.courses)
      if (c.grade) distribution[c.grade] = (distribution[c.grade] ?? 0) + 1;

  return {
    cumulative: calculateCumulativeGPA(semesters),
    highestSemesterGPA: highest,
    lowestSemesterGPA: lowest,
    totalUnitsEarned: semesters.reduce((a, s) => a + calculateSemesterGPA(s).unitsEarned, 0),
    totalUnitsAttempted: semesters.reduce((a, s) => a + calculateSemesterGPA(s).unitsAttempted, 0),
    gradeDistribution: distribution,
    semesterTrend: perSem.map((p) => ({ label: p.label, gpa: p.result.gpa })),
  };
}