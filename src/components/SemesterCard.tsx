"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CourseDataTable} from "@/components/GradesTable";
import {Course} from "@/schemas/schemas";
import data from "../app/data.json"

export const SemesterCard = () => {

    return (
        <Card className="@container/card">
            <CardHeader className="">
                <div className="flex flex-row gap-4 p-4">
                    <div className="">
                        <div>
                            <CardTitle>Courses</CardTitle>
                            <CardDescription>
                        <span className="hidden @[540px]/card:block">
                            All enrolled courses during the semester
                        </span>
                                <span className="@[540px]/card:hidden">semester</span>
                            </CardDescription>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            Semester 1
                        </div>
                        <div className="text-sm font-medium">
                            2025-2026
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CourseDataTable data={data as Course[]}/>
            </CardContent>
        </Card>
    )
}