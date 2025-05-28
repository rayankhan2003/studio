import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart3, Lightbulb, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: BookOpen,
    title: "Personalized Tests",
    description: "Tailor tests to your needs with subject and chapter-wise selections.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "Track your progress with insightful charts and graphs on your performance.",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Insights",
    description: "Get smart recommendations on what to study next based on your results.",
  },
  {
    icon: CheckCircle,
    title: "Comprehensive Review",
    description: "Review your answers, understand mistakes, and learn effectively.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center space-y-12">
      <section className="w-full py-12 md:py-24 lg:py-32 text-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Unlock Your Exam Potential with SmarterCat
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                  Your personalized AI-powered partner for acing competitive exams. Experience adaptive learning, detailed analytics, and focused preparation with SmarterCat.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              width="600"
              height="400"
              alt="Student studying"
              data-ai-hint="student studying"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              SmarterCat offers a comprehensive suite of tools designed to elevate your exam preparation.
            </p>
          </div>
          <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                     <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about-preview" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              About SmarterCat
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              SmarterCat was founded with a simple mission: to make exam preparation more effective, personalized, and accessible. We leverage cutting-edge AI and pedagogical insights to help students achieve their academic goals.
            </p>
            <Link href="/about">
              <Button variant="link" className="p-0 h-auto text-primary">
                Discover Our Story <span aria-hidden="true">&rarr;</span>
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/550x310.png"
              width="550"
              height="310"
              alt="Team working"
              data-ai-hint="team collaboration"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
