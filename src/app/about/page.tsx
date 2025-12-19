
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Lightbulb } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-lg">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">About DojoBeacon</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Empowering students to achieve their academic dreams through personalized and intelligent test preparation.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-semibold text-primary mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            At DojoBeacon, our mission is to revolutionize the way students prepare for exams. We believe that every student has unique learning needs and potential. By leveraging cutting-edge technology, including artificial intelligence and data analytics, we provide a tailored learning experience that adapts to individual strengths and weaknesses. Our goal is to make high-quality test preparation accessible, engaging, and ultimately, more effective.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We strive to build a platform that not only helps students achieve higher scores but also fosters a deeper understanding of subjects and builds lasting confidence.
          </p>
        </div>
        <div className="flex justify-center">
          <Image
            src="https://placehold.co/500x350.png"
            alt="Team discussing ideas"
            data-ai-hint="team discussion"
            width={500}
            height={350}
            className="rounded-lg shadow-xl"
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-primary mb-8 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="items-center text-center">
              <div className="p-3 bg-accent/10 rounded-full mb-2">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-xl">Student-Centric</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Our students are at the heart of everything we do. We design our tools and features to meet their diverse learning needs and help them succeed.
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-2">
                 <Lightbulb className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl">Innovation</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              We constantly explore new technologies and pedagogical approaches to enhance the learning experience and provide the most effective preparation tools.
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="items-center text-center">
               <div className="p-3 bg-green-500/10 rounded-full mb-2">
                <Target className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-xl">Excellence</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              We are committed to providing a high-quality platform, accurate content, and reliable support to ensure our students achieve their best possible outcomes.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Join Us on Your Journey to Success</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          DojoBeacon is more than just a test prep tool; it's your dedicated partner in achieving academic excellence.
        </p>
      </section>
    </div>
  );
}
