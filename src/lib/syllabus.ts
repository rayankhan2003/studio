// src/lib/syllabus.ts

export const Subjects = {
  BIOLOGY: "Biology",
  CHEMISTRY: "Chemistry",
  PHYSICS: "Physics",
  ENGLISH: "English",
  LOGICAL_REASONING: "Logical Reasoning",
} as const;

export type Subject = typeof Subjects[keyof typeof Subjects];

export interface Chapter {
  name: string;
  topics?: string[]; // Topics are optional for now, mainly for future granularity
}

export const syllabus: Record<Subject, Chapter[]> = {
  [Subjects.BIOLOGY]: [
    { name: "Acellular Life", topics: ["Viruses", "AIDS"] },
    { name: "Bioenergetics", topics: ["Photosynthesis", "Cellular Respiration"] },
    { name: "Biological Molecules", topics: ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids (RNA, DNA)"] },
    { name: "Cell Structure & Function", topics: ["Organelles", "Cell Membrane", "Cell Cycle"] },
    { name: "Coordination & Control", topics: ["Nervous System", "Endocrine System"] },
    { name: "Diversity Among Animals", topics: ["Invertebrates", "Vertebrates"] },
    { name: "Enzymes", topics: ["Mechanism of Action", "Factors Affecting Enzyme Activity"] },
    { name: "Evolution", topics: ["Lamarckism", "Darwinism", "Modern Synthesis"] },
    { name: "Prokaryotes", topics: ["Bacteria structure and reproduction"] },
    { name: "Reproduction", topics: ["Asexual and Sexual Reproduction", "Human Reproductive System"] },
    { name: "Support & Movement", topics: ["Skeletal System", "Muscular System"] },
    { name: "Inheritance", topics: ["Mendelian Genetics", "Linkage", "Crossing Over", "Sex-linked Traits"] },
    { name: "Form & Function in Plants", topics: ["Transport in Plants", "Plant Hormones"] },
    { name: "Circulation", topics: ["Heart structure and function", "Blood Vessels", "Blood Composition"] },
    { name: "Immunity", topics: ["Innate Immunity", "Adaptive Immunity", "Vaccination"] },
    { name: "Respiration", topics: ["Gaseous Exchange in Humans", "Respiratory Disorders"] },
  ],
  [Subjects.CHEMISTRY]: [
    { name: "Fundamental Concepts", topics: ["Stoichiometry", "Mole Concept", "Empirical and Molecular Formulas"] },
    { name: "Atomic Structure", topics: ["Discovery of Subatomic Particles", "Quantum Numbers", "Electronic Configuration"] },
    { name: "Gases", topics: ["Gas Laws", "Kinetic Molecular Theory of Gases"] },
    { name: "Liquids", topics: ["Properties of Liquids", "Intermolecular Forces"] },
    { name: "Solids", topics: ["Types of Solids", "Crystal Lattices"] },
    { name: "Chemical Equilibrium", topics: ["Equilibrium Constant", "Le Chatelier's Principle", "Acids & Bases", "pH", "Buffers"] },
    { name: "Reaction Kinetics", topics: ["Rate of Reaction", "Factors Affecting Rate", "Order of Reaction"] },
    { name: "Thermochemistry", topics: ["Enthalpy Changes", "Hess's Law"] },
    { name: "Electrochemistry", topics: ["Electrolytic Cells", "Galvanic Cells", "Nernst Equation"] },
    { name: "Chemical Bonding", topics: ["Ionic Bond", "Covalent Bond", "VSEPR Theory", "Hybridization"] },
    { name: "S & P Block Elements", topics: ["Group Trends", "Properties of Representative Elements"] },
    { name: "Transition Elements", topics: ["Properties", "Complex Formation"] },
    { name: "Organic Chemistry - Basics", topics: ["Nomenclature", "Isomerism"] },
    { name: "Hydrocarbons", topics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic Hydrocarbons"] },
    { name: "Alkyl Halides", topics: ["SN1 and SN2 Reactions"] },
    { name: "Alcohols and Phenols", topics: ["Properties", "Reactions"] },
    { name: "Aldehydes and Ketones", topics: ["Properties", "Reactions"] },
    { name: "Carboxylic Acids", topics: ["Properties", "Reactions"] },
    { name: "Macromolecules", topics: ["Proteins structure", "Enzymes function", "Polymers"] },
  ],
  [Subjects.PHYSICS]: [
    { name: "Force & Motion", topics: ["Kinematics", "Newton's Laws", "Projectile Motion", "Momentum", "Collisions"] },
    { name: "Work & Energy", topics: ["Work-Energy Theorem", "Potential and Kinetic Energy", "Power"] },
    { name: "Rotational & Circular Motion", topics: ["Angular Velocity", "Centripetal Force", "Torque"] },
    { name: "Waves", topics: ["Simple Harmonic Motion (SHM)", "Types of Waves", "Interference", "Diffraction", "Sound Waves", "Doppler Effect"] },
    { name: "Thermodynamics", topics: ["Laws of Thermodynamics", "Heat Engines", "Entropy"] },
    { name: "Electrostatics", topics: ["Coulomb's Law", "Electric Field", "Electric Potential", "Capacitance"] },
    { name: "Current Electricity", topics: ["Ohm's Law", "Resistance", "Circuits", "Kirchhoff's Laws"] },
    { name: "Electromagnetism", topics: ["Magnetic Field", "Force on Current-Carrying Conductors"] },
    { name: "Electromagnetic Induction", topics: ["Faraday's Law", "Lenz's Law", "Generators", "Transformers"] },
    { name: "Electronics", topics: ["Semiconductors", "Diodes", "Transistors (basic concepts)"] },
    { name: "Modern Physics", topics: ["Photoelectric Effect", "Photons", "Bohr's Model", "Atomic Spectra", "X-rays"] },
    { name: "Nuclear Physics", topics: ["Radioactivity", "Nuclear Reactions", "Mass-Energy Equivalence"] },
  ],
  [Subjects.ENGLISH]: [
    { name: "Vocabulary", topics: ["Context Clues", "Synonyms", "Antonyms", "Analogies"] },
    { name: "Grammar", topics: ["Tenses", "Sentence Structure", "Parts of Speech", "Punctuation", "Articles", "Prepositions", "Subject-Verb Agreement", "Direct/Indirect Speech", "Active/Passive Voice"] },
    { name: "Sentence Correction", topics: ["Identifying Errors", "Improving Sentences"] },
    { name: "Comprehension", topics: ["Reading Short Passages", "Answering Text-based Questions", "Identifying Main Idea", "Inferring Meaning"] },
  ],
  [Subjects.LOGICAL_REASONING]: [
    { name: "Critical Thinking", topics: ["Identifying Assumptions", "Evaluating Arguments", "Drawing Conclusions"] },
    { name: "Letter & Symbol Series", topics: ["Pattern Recognition"] },
    { name: "Logical Deductions", topics: ["Syllogisms", "Conditional Statements"] },
    { name: "Logical Problems", topics: ["Analytical Reasoning Puzzles"] },
    { name: "Course of Action", topics: ["Problem Solving Scenarios"] },
    { name: "Cause & Effect", topics: ["Identifying Causal Relationships"] },
  ],
};

export const allSubjects = Object.values(Subjects);
export const getChaptersForSubject = (subject: Subject): Chapter[] => syllabus[subject] || [];
