
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, Users, CreditCard, UserCog } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const features = [
    {
      title: "Manage Question Bank",
      description: "Upload, view, and delete questions from the question bank.",
      icon: BookOpen,
      href: "/admin/questions",
      cta: "Go to Questions",
    },
    {
      title: "View Subscriber Analytics",
      description: "See user demographics, subscription stats, and revenue.",
      icon: BarChart3,
      href: "/admin/analytics",
      cta: "View Analytics",
    },
    {
      title: "Admin Manager",
      description: "Create and manage sub-admin accounts and permissions.",
      icon: UserCog,
      href: "/admin/manager",
      cta: "Manage Admins",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts and subscriptions.",
      icon: Users,
      href: "#",
      cta: "Coming Soon",
      disabled: true,
    },
    {
      title: "Payment Settings",
      description: "Manage receiving account details for payments.",
      icon: CreditCard,
      href: "/admin/settings",
      cta: "Go to Settings",
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
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
