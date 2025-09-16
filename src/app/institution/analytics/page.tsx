
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstitutionAnalyticsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Institutional Analytics</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>This page will display detailed performance reports for classes and subjects within the institution.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
