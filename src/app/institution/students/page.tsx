
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageStudentsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>This page will be used to add students in bulk, view their progress, and manage accounts.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
