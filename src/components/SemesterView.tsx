"use client";

import { useSemesters } from "@/hooks/useSemesters";
import { SemesterDialog } from "@/components/SemesterDialog";
import { CourseDialog } from "@/components/CourseDialog";
import { CourseDataTable } from "@/components/GradesTable";
import { calculateSemesterGPA, calculateCumulativeGPA } from "@/lib/gpa";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function SemesterView() {
  const { semesters, isHydrated, deleteSemester } = useSemesters();

  // Hydration gate — prevents the empty-then-populated flash.
  if (!isHydrated) {
    return (
      <div className="space-y-4 px-4 lg:px-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Empty state.
  if (semesters.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="@container/card border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CardTitle>No semesters yet</CardTitle>
            <CardDescription className="max-w-sm">
              Add your first semester to start tracking courses and your GPA.
            </CardDescription>
            <SemesterDialog
              trigger={<Button className="mt-2">Add your first semester</Button>}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const cumulative = calculateCumulativeGPA(semesters);

  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 lg:px-6">
      {/* Cumulative summary + add action */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Cumulative GPA</p>
          <p className="text-2xl font-semibold tabular-nums">
            {cumulative.gpa ?? "N/A"}
          </p>
        </div>
        <SemesterDialog />
      </div>

      {semesters.map((sem) => {
        const result = calculateSemesterGPA(sem);
        const termLabel = sem.term === "Summer" ? "Summer" : `Semester ${sem.term}`;

        return (
          <Card key={sem.id} className="@container/card">
            <CardHeader>
              <div className="flex flex-row items-start gap-4">
                <div className="flex-1">
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>
                    <span className="hidden @[540px]/card:block">
                      All enrolled courses during the semester
                    </span>
                    <span className="@[540px]/card:hidden">semester</span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{termLabel}</div>
                  <div className="text-sm font-medium">{sem.schoolYear}</div>
                  <div className="mt-1 text-sm text-muted-foreground tabular-nums">
                    GPA {result.gpa ?? "N/A"} · {result.unitsEarned} units
                  </div>
                </div>
              </div>

              {/* Actions row — uses CardAction slot styling */}
              <CardAction className="flex gap-2">
                <CourseDialog semesterId={sem.id} />
                <SemesterDialog
                  semester={sem}
                  trigger={
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSemester(sem.id)}
                >
                  Delete
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent>
              {sem.courses.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No courses yet. Use “Add Course” to get started.
                </p>
              ) : (
                <CourseDataTable data={sem.courses} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}