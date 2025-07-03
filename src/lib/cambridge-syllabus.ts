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
      { name: "Cells" },
      { name: "Enzymes" },
      { name: "Plant nutrition and transport" },
      { name: "Human nutrition" },
      { name: "Human gas exchange" },
      { name: "Respiration" },
      { name: "Transport in humans" },
      { name: "Drugs and their effects" },
      { name: "Coordination and control" },
      { name: "Development of organisms and continuity of life" },
      { name: "Biotechnology and genetic modification" },
      { name: "Relationships of organisms with one another and with the environment" },
    ],
    [CambridgeSubjects.CHEMISTRY]: [
      { name: "States of matter" },
      { name: "Atoms, elements and compounds" },
      { name: "Stoichiometry" },
      { name: "Chemical energetics" },
      { name: "Chemical reactions" },
      { name: "Acids, bases and salts" },
      { name: "The Periodic Table" },
      { name: "Metals" },
      { name: "Chemistry of the environment" },
      { name: "Organic chemistry" },
    ],
    [CambridgeSubjects.PHYSICS]: [
      { name: "Motion, forces and energy" },
      { name: "Thermal physics" },
      { name: "Waves" },
      { name: "Electricity" },
      { name: "Nuclear physics" },
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
      { name: "Physical quantities and units" },
      { name: "Measurement techniques" },
      { name: "Kinematics" },
      { name: "Dynamics" },
      { name: "Forces, density and pressure" },
      { name: "Work, energy and power" },
      { name: "Deformation of solids" },
      { name: "Waves" },
      { name: "Superposition" },
      { name: "Electric fields" },
      { name: "Current of electricity" },
      { name: "D.C. circuits" },
      { name: "Particle and nuclear physics" },
      { name: "Motion in a circle" },
      { name: "Gravitational fields" },
      { name: "Ideal gases" },
      { name: "Temperature" },
      { name: "Thermal properties of materials" },
      { name: "Oscillations" },
      { name: "Communication" },
      { name: "Capacitance" },
      { name: "Electronics" },
      { name: "Magnetic fields" },
      { name: "Electromagnetic induction" },
      { name: "Alternating currents" },
      { name: "Quantum physics" },
    ],
  },
};

export const allCambridgeSubjects = Object.values(CambridgeSubjects);
export const allCambridgeLevels = Object.values(CambridgeLevels);
