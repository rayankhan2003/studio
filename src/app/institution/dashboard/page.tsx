
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function InstitutionDashboardPage() {
  const features = [
    {
      title: "Manage Teachers",
      description: "Add, view, and manage teacher accounts for your institution.",
      icon: Users,
      href: "/institution/teachers",
      cta: "Manage Teachers",
    },
    {
      title: "Manage Classes & Sections",
      description: "Create classes, organize sections, and manage student rosters.",
      icon: BookOpen,
      href: "/institution/sections",
      cta: "Manage Sections",
    },
    {
      title: "View Analytics",
      description: "See detailed performance reports for classes and subjects.",
      icon: BarChart3,
      href: "/institution/analytics",
      cta: "View Analytics",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Institution Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardContent>
               <Button asChild className="w-full">
                  <Link href={feature.href}>
                    {feature.cta}
                  </Link>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
