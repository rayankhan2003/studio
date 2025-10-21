
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export default function AdminContentPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Newspaper className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Manage Content</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Blogs, Articles & Announcements</CardTitle>
          <CardDescription>
            This is where you will be able to create, edit, and manage all the content for your homepage blog and announcements section.
          </CardDescription>
        </CardHeader>
      </Card>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Future Features</CardTitle>
          <CardDescription>
            Upcoming functionality will include a rich text editor, scheduling posts, and categorizing content.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
