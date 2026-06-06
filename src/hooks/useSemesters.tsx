"use client";

import { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import {
  AcademicRecord,
  AcademicRecordSchema,
  Semester,
  Course,
  CourseFormValues,
} from "@/schemas/schemas";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {generateId} from "@/lib/id";

const STORAGE_KEY = "gpa-calculator:academic-record";
const EMPTY_RECORD: AcademicRecord = { semesters: [] };

type SemesterInput = Omit<Semester, "id" | "courses">;

interface SemestersContextValue {
  record: AcademicRecord;
  semesters: Semester[];
  isHydrated: boolean;

  // Semester CRUD
  addSemester: (input: SemesterInput) => string; // returns new semester id
  updateSemester: (id: string, patch: Partial<SemesterInput>) => void;
  deleteSemester: (id: string) => void;

  // Course CRUD (scoped to a semester)
  addCourse: (semesterId: string, course: CourseFormValues) => void;
  updateCourse: (semesterId: string, courseId: string, patch: CourseFormValues) => void;
  deleteCourse: (semesterId: string, courseId: string) => void;

  resetAll: () => void;
}

const SemestersContext = createContext<SemestersContextValue | null>(null);

export function SemestersProvider({ children }: { children: ReactNode }) {
  const { value: record, setValue, isHydrated, clear } = useLocalStorage<AcademicRecord>(
    STORAGE_KEY,
    EMPTY_RECORD,
    { schema: AcademicRecordSchema },
  );

  /** Helper: immutably map over semesters. */
  const mapSemesters = useCallback(
    (fn: (s: Semester) => Semester) =>
      setValue((prev) => ({ ...prev, semesters: prev.semesters.map(fn) })),
    [setValue],
  );

  const addSemester = useCallback(
    (input: SemesterInput) => {
      const id = generateId();
      const newSemester: Semester = { id, courses: [], ...input };
      setValue((prev) => ({ ...prev, semesters: [...prev.semesters, newSemester] }));
      return id;
    },
    [setValue],
  );

  const updateSemester = useCallback(
    (id: string, patch: Partial<SemesterInput>) => {
      mapSemesters((s) => (s.id === id ? { ...s, ...patch } : s));
    },
    [mapSemesters],
  );

  const deleteSemester = useCallback(
    (id: string) => {
      setValue((prev) => ({
        ...prev,
        semesters: prev.semesters.filter((s) => s.id !== id),
      }));
    },
    [setValue],
  );

  const addCourse = useCallback(
    (semesterId: string, course: CourseFormValues) => {
      const newCourse: Course = { id: generateId(), ...course };
      mapSemesters((s) =>
        s.id === semesterId ? { ...s, courses: [...s.courses, newCourse] } : s,
      );
    },
    [mapSemesters],
  );

  const updateCourse = useCallback(
    (semesterId: string, courseId: string, patch: CourseFormValues) => {
      mapSemesters((s) =>
        s.id === semesterId
          ? {
              ...s,
              courses: s.courses.map((c) =>
                c.id === courseId ? { ...c, ...patch } : c,
              ),
            }
          : s,
      );
    },
    [mapSemesters],
  );

  const deleteCourse = useCallback(
    (semesterId: string, courseId: string) => {
      mapSemesters((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s,
      );
    },
    [mapSemesters],
  );

  const value = useMemo<SemestersContextValue>(
    () => ({
      record,
      semesters: record.semesters,
      isHydrated,
      addSemester,
      updateSemester,
      deleteSemester,
      addCourse,
      updateCourse,
      deleteCourse,
      resetAll: clear,
    }),
    [
      record, isHydrated, addSemester, updateSemester, deleteSemester,
      addCourse, updateCourse, deleteCourse, clear,
    ],
  );

  return <SemestersContext.Provider value={value}>{children}</SemestersContext.Provider>;
}

export function useSemesters(): SemestersContextValue {
  const ctx = useContext(SemestersContext);
  if (!ctx) {
    throw new Error("useSemesters must be used within a <SemestersProvider>");
  }
  return ctx;
}