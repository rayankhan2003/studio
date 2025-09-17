import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Brain, Settings2, TrendingUp, BookCopy, Rocket, Target, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Wh() {
  const features = [
    {
      icon: Brain,
      title: "AI Study Planner With Goal Setting",
      description: [
        "Start with your target MDCAT exam date and define goals for each subject — like “90% in Biology” or “Master Physics in 30 days.”",
        "Let our AI create a personalized day-by-day timetable.",
        "Track your chapter-wise progress.",
        "Re-adjust the plan dynamically if you're falling behind or ahead.",
        "Receive smart reminders, motivation tips, and updated plans via email (mock feature)."
      ],
    },
    {
      icon: Settings2,
      title: "Custom Test Creator: You Choose, You Control",
      description: [
        "Select any combination of subjects and chapters.",
        "Set your own question count (e.g., 5, 10, 25… even 100).",
        "Choose time per question (30s to 2 mins).",
        "Build practice tests that match your level and goals."
      ],
    },
    {
      icon: TrendingUp,
      title: "Goal-Oriented Analytics: Know Your Progress",
      description: [
        "Track your chapter-wise scores over time (shown in line graphs).",
        "Monitor subject-level performance vs. your set goals.",
        "See completion status of your study plan.",
        "Visual indicators and progress meters show exactly how close you are to your dream score."
      ],
    },
    {
      icon: BookCopy,
      title: "Full MDCAT Syllabus Coverage + Past Papers",
      description: [
        "Smartly categorized MCQs for Biology, Chemistry, Physics, English, and Logical Reasoning.",
        "Old MDCAT papers to simulate real exam pressure.",
        "Regular updates based on MDCAT 2025 curriculum (mock data used)."
      ],
    },
     {
      icon: Rocket,
      title: "Stay Motivated and On Track",
      description: [
        "Personalized insights from AI.",
        "Reminders to follow your planner.",
        "Progress alerts via email (mock feature).",
        "Adjustments when your actual performance needs an extra push."
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-12 sm:space-y-16 py-8 container mx-auto px-4">
      <section className="w-full text-center container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary/80 pt-8">
            🩺 Crack MDCAT 2025 with Confidence
          </h1>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted-foreground">
            Your Personalized Study Companion
          </p>
          <p className="mt-3 sm:mt-4 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to the most powerful MDCAT preparation platform built for <strong>ambitious students</strong> like you. Whether you're aiming for <strong>top government medical colleges</strong> or just starting your journey, we give you <strong>all the tools you need to succeed</strong> — from smart tests to intelligent planning and goal setting.
          </p>
        </div>
      </section>

      <section id="why-path2med" className="w-full py-10 sm:py-12 bg-muted/50 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              🚀 Why Thousands of MDCAT Students Will Trust path2med
            </h2>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md w-fit">
                      <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 text-sm sm:text-base text-muted-foreground list-disc list-inside pl-2">
                    {feature.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-10 sm:py-12 text-center container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="p-3 bg-primary/10 rounded-full inline-block mb-4">
             <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
            🧠 Study Smarter, Score Higher
          </h2>
          <p className="mt-3 sm:mt-4 text-md sm:text-lg text-muted-foreground">
            The key to cracking MDCAT isn't just hard work — it's <strong>smart strategy</strong>. With our platform, you’ll:
          </p>
          <ul className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left text-sm sm:text-base text-muted-foreground">
            {["Set clear goals", "Follow a dynamic AI plan", "Adapt as you learn", "Track real progress", "Stay motivated with purpose"].map(item => (
              <li key={item} className="flex items-center p-3 bg-card border rounded-md shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="w-full py-10 sm:py-12 bg-accent/10 rounded-lg">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl text-primary">
            Make Your MDCAT Prep a Journey — Not a Struggle
          </h2>
          <p className="mt-3 sm:mt-4 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            With path2med, your preparation is <strong>calculated</strong>, <strong>goal-driven</strong>, and <strong>data-backed</strong>. Whether it's your daily schedule, chapter mastery, or your final MDCAT strategy, you’ll always know <strong>where you stand</strong> — and what to do next.
          </p>
        </div>
      </section>

      <section className="w-full py-12 sm:py-16 text-center container px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
           <div className="p-3 bg-primary/10 rounded-full inline-block mb-4">
             <Send className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-3">
            Join Now — Demo Access Available!
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Thousands of students will trust path2med to generate their personal study plans, track their progress with real data, create smart tests, simulate the real exam, and reach their MBBS/BDS dreams.
          </p>
          <Button asChild size="lg" className="text-md sm:text-lg py-3 px-6 sm:py-7 sm:px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50 transition-shadow">
            <Link href="/account">
              Register Now & Start Your Journey
            </Link>
          </Button>
           <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
            Check our <Link href="/pricing" className="underline hover:text-primary">Pricing Page</Link> for Demo and Premium plan details.
          </p>
        </div>
      </section>
    </div>
  );
}
