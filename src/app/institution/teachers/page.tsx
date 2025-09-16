
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageTeachersPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Manage Teachers</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Teachers</CardTitle>
                    <CardDescription>This page will be used to add, view, and manage teacher accounts.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
