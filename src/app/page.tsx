
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Brain, Settings2, TrendingUp, BookCopy, Rocket, Target, Send, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';

interface Blog {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Silent';
  createdAt: string;
}

const defaultBlogPosts = [
    {
      id: 'default-1',
      title: "5 Time Management Tips for MDCAT Success",
      description: "Learn how to optimize your study schedule and make every minute count before the big exam.",
      href: "#",
      createdAt: "2024-08-05T10:00:00Z",
      status: 'Active'
    },
    {
      id: 'default-2',
      title: "Upcoming Workshop: Mastering Physics Concepts",
      description: "Join our free online workshop on August 15th to tackle the most challenging topics in Physics.",
      href: "#",
      createdAt: "2024-08-02T10:00:00Z",
      status: 'Active'
    },
    {
      id: 'default-3',
      title: "How to Use Past Papers Effectively",
      description: "A deep dive into the strategies for analyzing past papers to predict patterns and improve your score.",
      href: "#",
      createdAt: "2024-07-28T10:00:00Z",
      status: 'Active'
    }
  ];

export default function Wh() {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);

  useEffect(() => {
    try {
        const storedBlogsRaw = localStorage.getItem('dojobeacon-blogs');
        const storedBlogs: Blog[] = storedBlogsRaw ? JSON.parse(storedBlogsRaw) : [];
        
        const activeBlogs = storedBlogs.filter(blog => blog.status === 'Active');

        if (activeBlogs.length > 0) {
            setBlogPosts(activeBlogs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
        } else {
             // If no active blogs, show default ones
            setBlogPosts(defaultBlogPosts.slice(0, 3));
        }
    } catch (e) {
        console.error("Failed to load blog posts, using default.", e);
        setBlogPosts(defaultBlogPosts.slice(0, 3));
    }
  }, []);

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
            🩺 Crack MDCAT with Confidence
          </h1>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted-foreground">
            Your Personalized Study Companion
          </p>
          <p className="mt-3 sm:mt-4 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to the most powerful MDCAT preparation platform built for <strong>ambitious students</strong> like you. Whether you're aiming for <strong>top government medical colleges</strong> or just starting your journey, we give you <strong>all the tools you need to succeed</strong> — from smart tests to intelligent planning and goal setting.
          </p>
        </div>
      </section>

      <section id="why-dojobeacon" className="w-full py-10 sm:py-12 bg-muted/50 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              🚀 Why Thousands of MDCAT Students Will Trust DojoBeacon
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
      
      <section id="blog" className="w-full py-10 sm:py-12">
        <div className="container px-4 md:px-6">
           <div className="text-center mb-8 sm:mb-12">
            <div className="p-3 bg-primary/10 rounded-full inline-block mb-4">
               <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              Latest News & Articles
            </h2>
            <p className="mt-3 sm:mt-4 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest exam tips, announcements, and success stories from the DojoBeacon team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                     <p className="text-xs text-muted-foreground pt-1">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">{post.description}</p>
                </CardContent>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href="#">Read More</Link>
                  </Button>
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
            With DojoBeacon, your preparation is <strong>calculated</strong>, <strong>goal-driven</strong>, and <strong>data-backed</strong>. Whether it's your daily schedule, chapter mastery, or your final MDCAT strategy, you’ll always know <strong>where you stand</strong> — and what to do next.
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
            Thousands of students will trust DojoBeacon to generate their personal study plans, track their progress with real data, create smart tests, simulate the real exam, and reach their MBBS/BDS dreams.
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
