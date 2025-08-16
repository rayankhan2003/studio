
import { config } from "dotenv";
config({ path: new URL("../../.env", import.meta.url).pathname });

import { connectDB } from "../config/db.js";
import Course from "../models/Course.js";

const O_LEVEL_CHAPTERS = [
  "Cell Structure", "Enzymes", "Transport in Cells", "Bioenergetics", "Coordination & Control"
].map((title, i) => ({ title, order: i + 1 }));

const A_LEVEL_CHAPTERS = [
  "Biological Molecules", "Cell Structure & Function", "Genetics & Inheritance",
  "Immunity", "Respiration", "Photosynthesis"
].map((t, i) => ({ title: t, order: i + 1 }));

const subjects = (chapters) => ([
  { name: "Biology", chapters },
  { name: "Physics", chapters: chapters.slice(0, 4) },     // placeholder chapters
  { name: "Chemistry", chapters: chapters.slice(0, 4) }    // placeholder chapters
]);

(async () => {
  await connectDB();
  await Course.deleteMany({});
  await Course.create({ level: "O Level", subjects: subjects(O_LEVEL_CHAPTERS) });
  await Course.create({ level: "A Level", subjects: subjects(A_LEVEL_CHAPTERS) });
  console.log("✅ Seeded Cambridge structure");
  process.exit(0);
})();
