"use client";

import { useEffect, useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Course,
  CourseFormValues,
  CourseFormSchema,
  GradeSchema,
  Grade,
} from "@/schemas/schemas";
import { useSemesters } from "@/hooks/useSemesters";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const NO_GRADE = "__none__"; // sentinel — Select can't bind to null/""

const DEFAULTS: CourseFormValues = {
  code: "",
  name: "",
  units: 3,
  grade: null,
};

interface CourseDialogProps {
  semesterId: string;
  course?: Course;
  trigger?: ReactNode | null;          // allow null (no trigger)
  open?: boolean;                       // controlled open (optional)
  onOpenChange?: (open: boolean) => void;
}

export function CourseDialog({
  semesterId, course, trigger, open: openProp, onOpenChange,
}: CourseDialogProps) {
  const { addCourse, updateCourse } = useSemesters();
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = Boolean(course);

  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(CourseFormSchema),
    defaultValues: course
      ? { code: course.code, name: course.name, units: course.units, grade: course.grade }
      : DEFAULTS,
  });

  // Reset the form whenever the dialog opens (so edit reflects latest values
  // and add starts clean).
  useEffect(() => {
    if (open) {
      form.reset(
        course
          ? { code: course.code, name: course.name, units: course.units, grade: course.grade }
          : DEFAULTS,
      );
    }
  }, [open, course, form]);

  function onSubmit(values: CourseFormValues) {
    if (isEdit && course) {
      updateCourse(semesterId, course.id, values);
    } else {
      addCourse(semesterId, values);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? <Button size="sm">{isEdit ? "Edit" : "Add Course"}</Button>}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit course" : "Add course"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the course details below."
              : "Enter the course details. Grade can be left empty for in-progress courses."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course code</FormLabel>
                  <FormControl>
                    <Input placeholder="CCC101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course name</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Programming 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        // RHF stores the raw input as string; coerce to number.
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        value={Number.isNaN(field.value) ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select
                      value={field.value ?? NO_GRADE}
                      onValueChange={(v) =>
                        field.onChange(v === NO_GRADE ? null : (v as Grade))
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_GRADE}>No grade yet</SelectItem>
                        {GradeSchema.options.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save changes" : "Add course"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}