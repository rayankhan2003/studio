// src/lib/cambridge-syllabus.ts

export const CambridgeSubjects = {
  BIOLOGY: "Biology",
  CHEMISTRY: "Chemistry",
  PHYSICS: "Physics",
} as const;
export type CambridgeSubject = typeof CambridgeSubjects[keyof typeof CambridgeSubjects];

export const CambridgeLevels = {
  O_LEVEL: "O Level",
  A_LEVEL: "A Level",
} as const;
export type CambridgeLevel = typeof CambridgeLevels[keyof typeof CambridgeLevels];

export interface CambridgeChapter {
  name: string;
  topics?: string[];
}

export const cambridgeSyllabus: Record<CambridgeLevel, Record<CambridgeSubject, CambridgeChapter[]>> = {
  [CambridgeLevels.O_LEVEL]: {
    [CambridgeSubjects.BIOLOGY]: [
      { name: "Cell Structure and Organisation" },
      { name: "Diffusion and Osmosis" },
      { name: "Enzymes" },
      { name: "Plant Nutrition" },
      { name: "Animal Nutrition" },
      { name: "Transport in Flowering Plants" },
      { name: "Transport in Humans" },
      { name: "Respiration" },
    ],
    [CambridgeSubjects.CHEMISTRY]: [
      { name: "The Particulate Nature of Matter" },
      { name: "Experimental Techniques" },
      { name: "Atoms, Elements and Compounds" },
      { name: "Stoichiometry" },
      { name: "Electricity and Chemistry" },
      { name: "Energy Changes" },
      { name: "The Periodic Table" },
      { name: "Metals" },
    ],
    [CambridgeSubjects.PHYSICS]: [
      { name: "Physical Quantities and Units" },
      { name: "Kinematics" },
      { name: "Dynamics" },
      { name: "Mass, Weight and Density" },
      { name: "Turning Effects of Forces" },
      { name: "Pressure" },
      { name: "Energy, Work and Power" },
      { name: "Kinetic Model of Matter" },
    ],
  },
  [CambridgeLevels.A_LEVEL]: {
    [CambridgeSubjects.BIOLOGY]: [
        { name: "Cell structure" },
        { name: "Biological molecules" },
        { name: "Enzymes" },
        { name: "Cell membranes and transport" },
        { name: "The mitotic cell cycle" },
        { name: "Nucleic acids and protein synthesis" },
        { name: "Transport in plants" },
        { name: "Transport in mammals" },
        { name: "Gas exchange and smoking" },
        { name: "Infectious disease" },
        { name: "Immunity" },
        { name: "Energy and respiration" },
        { name: "Photosynthesis" },
        { name: "Homeostasis" },
        { name: "Control and coordination" },
        { name: "Inherited change" },
        { name: "Selection and evolution" },
        { name: "Biodiversity, classification and conservation" },
        { name: "Genetic technology" },
    ],
    [CambridgeSubjects.CHEMISTRY]: [
      { name: "Atoms, Molecules and Stoichiometry" },
      { name: "Atomic Structure" },
      { name: "Chemical Bonding" },
      { name: "States of Matter" },
      { name: "Chemical Energetics" },
      { name: "Electrochemistry" },
      { name: "Equilibria" },
      { name: "Reaction Kinetics" },
    ],
    [CambridgeSubjects.PHYSICS]: [
      { name: "Physical Quantities and Units" },
      { name: "Measurement Techniques" },
      { name: "Kinematics" },
      { name: "Dynamics" },
      { name: "Forces" },
      { name: "Work, Energy and Power" },
      { name: "Motion in a Circle" },
      { name: "Gravitational Fields" },
    ],
  },
};

export const allCambridgeSubjects = Object.values(CambridgeSubjects);
export const allCambridgeLevels = Object.values(CambridgeLevels);
