
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is DojoBeacon?",
    answer: "DojoBeacon is an AI-powered online platform designed to help students prepare for academic and competitive exams. We offer personalized test preparation, real-time performance analytics, and an intuitive dashboard.",
  },
  {
    question: "How does the AI recommendation work?",
    answer: "Our AI analyzes your performance on past tests, considering scores in different subjects and chapters. Based on this, it identifies your weaker areas and suggests specific topics to focus on to maximize your score improvement.",
  },
  {
    question: "What types of questions are available?",
    answer: "DojoBeacon supports various question formats including single-choice, multiple-choice, fill-in-the-blanks, and true/false questions to provide a comprehensive testing experience.",
  },
  {
    question: "Can I track my progress over time?",
    answer: "Yes! Our analytics dashboard provides visual charts and graphs showing your subject-wise scores, chapter-wise proficiency, and overall progress over time. You can filter this data weekly, monthly, or by test.",
  },
  {
    question: "Is there a free trial or plan?",
    answer: "Currently, DojoBeacon offers specific packages. Please check our (upcoming) pricing page for more details on subscription models and payment options. We may introduce trial periods in the future.",
  },
  {
    question: "How is my data protected?",
    answer: "We take data privacy and security very seriously. All user data is encrypted and handled in accordance with our Privacy Policy. We do not share your personal information with third parties without your consent.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center pt-8 pb-4">
         <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-10 w-10 text-primary" />
         </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about DojoBeacon.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index} className="bg-card shadow-sm rounded-md mb-3 overflow-hidden">
            <AccordionTrigger className="px-6 py-4 text-lg hover:bg-muted/50 transition-colors data-[state=open]:bg-muted/50">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-0 text-base text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center mt-12 py-8 border-t">
        <h2 className="text-2xl font-semibold mb-3">Still have questions?</h2>
        <p className="text-muted-foreground mb-4">
          If you can't find the answer you're looking for, please feel free to contact us.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
