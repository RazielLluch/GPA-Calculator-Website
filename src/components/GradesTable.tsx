// components/course-data-table.tsx

"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import {Course} from "@/schemas/schemas";
import {cn} from "@/lib/utils";


// ======================
// Columns
// ======================

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => {
      return (
        <div className="max-w-30 truncate sm:max-w-62.5 font-medium">
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => {
      return (
          <Badge
              className="w-9 justify-center bg-blue-500 text-white"
          >
            <strong>
              {row.original.units}
            </strong>
          </Badge>
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => {

      const gradeBadgeStyles: Record<string, string> = {
        "1.0": "bg-[rgb(19,75,26)]",
        "1.25": "bg-[rgb(76,175,50)]",
        "1.5": "bg-[rgb(139,195,49)]",
        "1.75": "bg-[rgb(205,220,82)]",
        "2.0": "bg-[rgb(255,207,75)]",
        "2.25": "bg-[rgb(249,179,47)]",
        "2.5": "bg-[rgb(243,156,12)]",
        "2.75": "bg-[rgb(230,126,22)]",
        "3.0": "bg-[rgb(200,64,00)]",

        "INC": "bg-[rgb(191,191,191)]",
        "In Progress": "border border-blue-500 text-blue-500",
        null: "bg-[rgb(149,206,255)] text-secondary-foreground",
      };

      const grade = row.original.grade;

      const label = grade ?? "No Grade";

      if (grade === null) {
        return (
            <div></div>
        )
      }

      return (
          <Badge
              className={cn(
                  "w-10 justify-center",
                  gradeBadgeStyles[label]
              )}
          >
            <strong>
              {label}
            </strong>
          </Badge>
      );
    },
  },
];

// ======================
// Component
// ======================

interface CourseDataTableProps {
  className?: string;
  data: Course[];
}

export function CourseDataTable({
                                  className,
                                  data,
                                }: CourseDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody className="">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/*<div className="flex items-center justify-end gap-2">*/}
      {/*  <Button*/}
      {/*    variant="outline"*/}
      {/*    size="sm"*/}
      {/*    onClick={() => table.previousPage()}*/}
      {/*    disabled={!table.getCanPreviousPage()}*/}
      {/*  >*/}
      {/*    Previous*/}
      {/*  </Button>*/}
      {/*  */}
      {/*  <Button*/}
      {/*    variant="outline"*/}
      {/*    size="sm"*/}
      {/*    onClick={() => table.nextPage()}*/}
      {/*    disabled={!table.getCanNextPage()}*/}
      {/*  >*/}
      {/*    Next*/}
      {/*  </Button>*/}
      {/*</div>*/}
    </div>
  );
}