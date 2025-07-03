
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
      { name: "Atoms, molecules and stoichiometry" },
      { name: "Atomic structure" },
      { name: "Chemical bonding" },
      { name: "States of matter" },
      { name: "Chemical energetics" },
      { name: "Electrochemistry" },
      { name: "Equilibria" },
      { name: "Reaction kinetics" },
      { name: "The Periodic Table: chemical periodicity" },
      { name: "An introduction to the chemistry of transition elements" },
      { name: "Nitrogen and sulphur" },
      { name: "An introduction to organic chemistry" },
      { name: "Hydrocarbons" },
      { name: "Halogen derivatives" },
      { name: "Hydroxyl compounds" },
      { name: "Carbonyl compounds" },
      { name: "Carboxylic acids and derivatives" },
      { name: "Nitrogen compounds" },
      { name: "Polymerisation" },
      { name: "Analytical techniques" },
      { name: "Organic synthesis" },
    ],
    [CambridgeSubjects.PHYSICS]: [
      { name: "Physical Quantities and Units" },
      { name: "Measurement Techniques" },
      { name: "Kinematics" },
      { name: "Dynamics" },
      { name: "Forces, Density and Pressure" },
      { name: "Work, Energy and Power" },
      { name: "Deformation of Solids" },
      { name: "Waves" },
      { name: "Superposition" },
      { name: "Electric Fields" },
      { name: "Current of Electricity" },
      { name: "D.C. Circuits" },
      { name: "Particle and Nuclear Physics" },
      { name: "Motion in a Circle" },
      { name: "Gravitational Fields" },
      { name: "Ideal Gases" },
      { name: "Temperature" },
      { name: "Thermal Properties of Materials" },
      { name: "Oscillations" },
      { name: "Communication" },
      { name: "Capacitance" },
      { name: "Electronics" },
      { name: "Magnetic Fields" },
      { name: "Electromagnetic Induction" },
      { name: "Alternating Currents" },
      { name: "Quantum Physics" },
    ],
  },
};

export const allCambridgeSubjects = Object.values(CambridgeSubjects);
export const allCambridgeLevels = Object.values(CambridgeLevels);
