
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, Users, CreditCard, UserCog } from "lucide-react";
import Link from "next/link";

export default function TeacherDashboardPage() {
  const features = [
    {
      title: "Create & Manage Tests",
      description: "Build new tests from the question bank and assign them to your classes.",
      icon: BookOpen,
      href: "/teacher/tests",
      cta: "Manage Tests",
      disabled: false,
    },
    {
      title: "View Student Analytics",
      description: "See performance reports for your students and classes.",
      icon: BarChart3,
      href: "/teacher/analytics",
      cta: "View Analytics",
      disabled: false,
    },
    {
      title: "Manage Your Classes",
      description: "View your assigned classes and student rosters.",
      icon: Users,
      href: "#",
      cta: "Coming Soon",
      disabled: true,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
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
               <Button asChild className="w-full" disabled={feature.disabled}>
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
