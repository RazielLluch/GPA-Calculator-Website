"use client";

import { useEffect, useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Semester, SemesterSchema } from "@/schemas/schemas";
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

// Form schema = semester fields without generated id/courses.
const SemesterFormSchema = SemesterSchema.omit({ id: true, courses: true });
type SemesterFormValues = z.infer<typeof SemesterFormSchema>;

const DEFAULTS: SemesterFormValues = {
  term: "1",
  schoolYear: "2025-2026",
};

interface SemesterDialogProps {
  /** Pass an existing semester to edit; omit to add a new one. */
  semester?: Semester;
  trigger?: ReactNode;
}

export function SemesterDialog({ semester, trigger }: SemesterDialogProps) {
  const { addSemester, updateSemester } = useSemesters();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(semester);

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(SemesterFormSchema),
    defaultValues: semester
      ? { term: semester.term, schoolYear: semester.schoolYear }
      : DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        semester
          ? { term: semester.term, schoolYear: semester.schoolYear }
          : DEFAULTS,
      );
    }
  }, [open, semester, form]);

  function onSubmit(values: SemesterFormValues) {
    if (isEdit && semester) {
      updateSemester(semester.id, values);
    } else {
      addSemester(values);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">{isEdit ? "Edit semester" : "Add semester"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit semester" : "Add semester"}</DialogTitle>
          <DialogDescription>
            Choose the term and school year for this semester.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">First Semester</SelectItem>
                      <SelectItem value="2">Second Semester</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schoolYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School year</FormLabel>
                  <FormControl>
                    <Input placeholder="2025-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save changes" : "Add semester"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}