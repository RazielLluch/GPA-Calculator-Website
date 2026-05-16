import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import * as React from "react";

import data from "./data.json"
import {CourseDataTable} from "@/components/GradesTable";
import {Course} from "@/schemas/schemas";

export default function Page() {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">
                                <Card className="@container/card">
                                    <CardHeader>
                                        <CardTitle>Courses</CardTitle>
                                        <CardDescription>
                                        <span className="hidden @[540px]/card:block">
                                            All enrolled courses during the semester
                                        </span>
                                            <span className="@[540px]/card:hidden">semester</span>
                                        </CardDescription>
                                        <CourseDataTable data={data as Course}/>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
