"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

import {
  allSubjects as allMdcatSubjects,
  syllabus as mdcatSyllabus,
} from "@/lib/syllabus";
import {
  allCambridgeSubjects,
  cambridgeSyllabus,
  CambridgeLevels,
} from "@/lib/cambridge-syllabus";

import {
  Settings,
  ListChecks,
  Clock,
  Hash,
  PlayCircle,
  AlertCircle,
  Info,
  Archive,
  ChevronDown,
  GraduationCap,
  Zap,
  User,
} from "lucide-react";

import { mockQuestionsDb } from "@/lib/mock-questions-db";

type Curriculum = "MDCAT" | "O Level" | "A Level";
type SelectedChaptersMap = Record<string, Set<string>>;

const questionCountPresets = [5, 10, 15, 20, 30, 50, 100];
const timePerQuestionOptions = [
  { label: "30 seconds", value: 30 },
  { label: "45 seconds", value: 45 },
  { label: "60 seconds", value: 60 },
  { label: "90 seconds", value: 90 },
  { label: "120 seconds", value: 120 },
];

export default function CustomTestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [curriculum, setCurriculum] = useState<Curriculum>("MDCAT");
  const [testName, setTestName] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  /* ---------------- INITIAL STATE ---------------- */

  const initialSelectedChapters = useCallback((): SelectedChaptersMap => {
    const state: Partial<SelectedChaptersMap> = {};
    [...allMdcatSubjects, ...allCambridgeSubjects].forEach((s) => {
      state[s] = new Set<string>();
    });
    return state as SelectedChaptersMap;
  }, []);

  const [selectedChaptersMap, setSelectedChaptersMap] =
    useState<SelectedChaptersMap>(initialSelectedChapters());

  const [questionCountMode, setQuestionCountMode] =
    useState<"preset" | "custom">("preset");
  const [selectedPresetQuestions, setSelectedPresetQuestions] =
    useState<number>(10);
  const [customQuestionCount, setCustomQuestionCount] =
    useState<string>("10");
  const [timePerQuestion, setTimePerQuestion] =
    useState<number>(60);
  const [activeAccordionItems, setActiveAccordionItems] =
    useState<string[]>([]);

  /* ---------------- SYLLABUS ---------------- */

  const { subjects, syllabus } = useMemo(() => {
    if (curriculum === "O Level") {
      return {
        subjects: allCambridgeSubjects,
        syllabus: cambridgeSyllabus[CambridgeLevels.O_LEVEL],
      };
    }
    if (curriculum === "A Level") {
      return {
        subjects: allCambridgeSubjects,
        syllabus: cambridgeSyllabus[CambridgeLevels.A_LEVEL],
      };
    }
    return {
      subjects: allMdcatSubjects,
      syllabus: mdcatSyllabus,
    };
  }, [curriculum]);

  /* ---------------- SEARCH PARAMS ---------------- */

  useEffect(() => {
    const testNameQuery = searchParams.get("testName");
    if (testNameQuery) setTestName(testNameQuery);
    else setTestName(`My ${curriculum} Test`);
  }, [searchParams, curriculum]);

  /* ---------------- COUNTS ---------------- */

  const totalSelectedChaptersCount = useMemo(
    () =>
      Object.values(selectedChaptersMap).reduce(
        (acc, set) => acc + set.size,
        0
      ),
    [selectedChaptersMap]
  );

  const actualQuestionCount =
    questionCountMode === "preset"
      ? selectedPresetQuestions
      : parseInt(customQuestionCount) || 0;

  const totalDuration = actualQuestionCount * timePerQuestion;

  /* ---------------- ACTION ---------------- */

  const handleStart = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to start a test",
        action: (
          <Button asChild>
            <Link href="/auth">Login</Link>
          </Button>
        ),
      });
      router.push("/auth");
      return;
    }

    router.push(
      `/test/custom-session?curriculum=${curriculum}&questionCount=${actualQuestionCount}`
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Make Your Test</h1>
      </div>

      {!user && (
        <Alert className="border-amber-500/50 bg-amber-50/50">
          <User className="h-4 w-4 text-amber-600" />
          <AlertTitle>Login to Track Progress</AlertTitle>
          <AlertDescription>
            <Link href="/auth" className="underline font-semibold">
              Login or create account
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={curriculum} onValueChange={(v) => setCurriculum(v as Curriculum)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="MDCAT">MDCAT</TabsTrigger>
          <TabsTrigger value="O Level">O Level</TabsTrigger>
          <TabsTrigger value="A Level">A Level</TabsTrigger>
        </TabsList>
      </Tabs>

      <Button
        size="lg"
        className="w-full py-6 text-lg"
        onClick={handleStart}
        disabled={totalSelectedChaptersCount === 0}
      >
        <PlayCircle className="mr-2 h-6 w-6" />
        Start Custom Test
      </Button>
    </div>
  );
}
