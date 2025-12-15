export interface ROSReport {
  isValid: boolean;
  syntaxCheck: {
    status: 'PASS' | 'FAIL';
    details: string;
  };
  structureCheck: {
    status: 'PASS' | 'FAIL';
    missingFiles: string[];
  };
  nodesDetected: string[];
  topics: {
    publishers: string[];
    subscribers: string[];
  };
  safetyHeuristics: {
    status: 'SAFE' | 'WARNING' | 'DANGER';
    issues: string[];
  };
  timestamp: string;
}

export interface SimulationStep {
  time: number;
  jointPositions: number[]; // 6-DOF
  success: boolean;
  log: string;
}

export interface SimulationResult {
  frames: string[]; // URLs to images
  logs: string[];
  data: SimulationStep[];
  success: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REPORT_READY = 'REPORT_READY',
  SIMULATING = 'SIMULATING',
  SIMULATION_COMPLETE = 'SIMULATION_COMPLETE',
}
