"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EllipsisVerticalIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Course, Grade } from "@/schemas/schemas";
import { useSemesters } from "@/hooks/useSemesters";
import { CourseDialog } from "@/components/CourseDialog";
import { cn } from "@/lib/utils";

// ======================
// Grade badge styles (PH 1.0–5.0 scale — lower is better)
// Centralized: keyed by every Grade enum value. No dead keys.
// ======================
const gradeBadgeStyles: Record<Grade, string> = {
  "1.0": "bg-[rgb(19,75,26)] text-white",
  "1.25": "bg-[rgb(76,175,50)] text-white",
  "1.5": "bg-[rgb(139,195,49)] text-white",
  "1.75": "bg-[rgb(205,220,82)] text-black",
  "2.0": "bg-[rgb(255,207,75)] text-black",
  "2.25": "bg-[rgb(249,179,47)] text-black",
  "2.5": "bg-[rgb(243,156,12)] text-white",
  "2.75": "bg-[rgb(230,126,22)] text-white",
  "3.0": "bg-[rgb(200,64,0)] text-white",
  "5.0": "bg-red-600 text-white", // failing
  INC: "bg-[rgb(191,191,191)] text-black", // counts as 5.0 until complied
  P: "bg-emerald-600 text-white", // pass (non-numeric, e.g. thesis)
  F: "bg-red-700 text-white", // fail (non-numeric)
  "In Progress": "border border-blue-500 text-blue-500",
};

// ======================
// Column factory — needs semesterId + the edit/delete handlers,
// so columns are built per-semester rather than module-level.
// ======================
function getColumns(
  semesterId: string,
  onDelete: (courseId: string) => void,
): ColumnDef<Course>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Course Name",
      cell: ({ row }) => (
        <div className="max-w-[7.5rem] truncate font-medium sm:max-w-[15.625rem]">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "units",
      header: "Units",
      cell: ({ row }) => (
        <Badge className="w-9 justify-center bg-blue-500 text-white">
          <strong>{row.original.units}</strong>
        </Badge>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => {
        const grade = row.original.grade;
        if (grade === null) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <Badge className={cn("min-w-10 justify-center", gradeBadgeStyles[grade])}>
            <strong>{grade}</strong>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <CourseRowActions
          semesterId={semesterId}
          course={row.original}
          onDelete={onDelete}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

// ======================
// Row actions — Edit opens CourseDialog (controlled), Delete calls deleteCourse
// ======================
function CourseRowActions({
  semesterId,
  course,
  onDelete,
}: {
  semesterId: string;
  course: Course;
  onDelete: (courseId: string) => void;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground data-[state=open]:bg-muted"
          >
            <EllipsisVerticalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();             // don't let Radix steal focus on close
              setMenuOpen(false);
              // open AFTER the menu has fully closed/unmounted
              setTimeout(() => setEditOpen(true), 0);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              console.log("[delete] firing for", course.id); // temporary
              onDelete(course.id);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CourseDialog
        semesterId={semesterId}
        course={course}
        open={editOpen}
        onOpenChange={setEditOpen}
        trigger={null}
      />
    </div>
  );
}

// ======================
// Component (already controlled by `data` prop — no internal useState)
// ======================
interface CourseDataTableProps {
  className?: string;
  semesterId: string;
  data: Course[];
}

export function CourseDataTable({
  className,
  semesterId,
  data,
}: CourseDataTableProps) {
  const { deleteCourse } = useSemesters();

  const handleDelete = React.useCallback(
    (courseId: string) => deleteCourse(semesterId, courseId),
    [deleteCourse, semesterId],
  );

  // Memoize so columns aren't rebuilt every render (handlers are stable).
  const columns = React.useMemo(
    () => getColumns(semesterId, handleDelete),
    [semesterId, handleDelete],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // stable row identity = correct re-render on edit/delete
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}