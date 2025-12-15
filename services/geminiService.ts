import { GoogleGenAI, Type } from "@google/genai";
import { ROSReport, SimulationResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

/**
 * Mocks the backend code checker by asking Gemini to hallucinate a report based on the filename.
 * This simulates the behavior described in the PDF: Syntax Check, Structure Check, etc.
 */
export const analyzeROSCode = async (filename: string): Promise<ROSReport> => {
  const isFaulty = filename.toLowerCase().includes('faulty');

  const prompt = `
    You are a backend service for a ROS (Robot Operating System) code checker.
    A user has uploaded a file named "${filename}".
    
    Generate a JSON report mimicking a static analysis tool.
    
    If the filename contains "faulty", generate a FAIL report with syntax errors, missing package.xml, or unsafe loops.
    If the filename does not contain "faulty", generate a PASS report with clean syntax, proper structure, and safe heuristics.
    
    The detected nodes should correspond to a simple robotic arm pick-and-place task (e.g., "pick_place_node", "motion_planner").
    Topics should be relevant (e.g., "/joint_states", "/cmd_vel").
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            syntaxCheck: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['PASS', 'FAIL'] },
                details: { type: Type.STRING }
              }
            },
            structureCheck: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['PASS', 'FAIL'] },
                missingFiles: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            nodesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            topics: {
              type: Type.OBJECT,
              properties: {
                publishers: { type: Type.ARRAY, items: { type: Type.STRING } },
                subscribers: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            safetyHeuristics: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['SAFE', 'WARNING', 'DANGER'] },
                issues: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            timestamp: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ROSReport;

  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback if API fails
    return {
      isValid: !isFaulty,
      syntaxCheck: { status: isFaulty ? 'FAIL' : 'PASS', details: isFaulty ? 'Syntax error in line 42: missing semicolon' : 'flake8 passed.' },
      structureCheck: { status: 'PASS', missingFiles: [] },
      nodesDetected: ['pick_and_place'],
      topics: { publishers: ['/joint_trajectory'], subscribers: ['/joint_states'] },
      safetyHeuristics: { status: isFaulty ? 'DANGER' : 'SAFE', issues: isFaulty ? ['Infinite loop detected without rate.sleep()'] : [] },
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Mocks the simulation runner.
 */
export const runSimulation = async (report: ROSReport): Promise<SimulationResult> => {
    // Generate realistic logs and data points
    const steps = 20;
    const data = [];
    const logs = [];
    
    logs.push("[INFO] [Launch]: Starting Gazebo simulator...");
    logs.push("[INFO] [Spawn]: Spawning UR5 robot at origin.");
    logs.push("[INFO] [Spawn]: Spawning target cube at (0.5, 0.2, 0.1).");
    logs.push("[INFO] [Node]: Starting verified ROS node...");

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        // Simulate simple joint movement (sine wave-ish)
        const j1 = Math.sin(progress * Math.PI); 
        const j2 = -Math.cos(progress * Math.PI / 2);
        
        data.push({
            time: i * 0.5,
            jointPositions: [j1, j2, j1 * 0.5, 0, 0, 0], // Simplified 6DOF
            success: i === steps,
            log: `[INFO] [Motion]: Trajectory execution ${(progress * 100).toFixed(0)}% complete.`
        });
        
        if (i % 5 === 0) {
            logs.push(`[INFO] [Controller]: Joint states updated. Error: ${(0.1 / (i+1)).toFixed(4)}`);
        }
    }
    
    logs.push("[INFO] [Task]: Gripper activated.");
    logs.push("[INFO] [Task]: Object attached.");
    logs.push("[SUCCESS] [Goal]: Cube moved to target position successfully.");

    // Generate placeholder frame URLs
    const frames = Array.from({ length: 5 }, (_, i) => `https://picsum.photos/800/450?random=${i}&grayscale`);

    return {
        frames,
        logs,
        data,
        success: true
    };
};
