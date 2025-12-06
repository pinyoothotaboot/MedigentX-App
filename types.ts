
export interface User {
  id: string;
  email: string;
  name: string;
  license: string;
  role: 'doctor' | 'admin';
  firstName?: string;
  lastName?: string;
}

export enum NoteType {
  StandardSOAP = 'StandardSOAP',
  SOAPList = 'SOAPList',
  Psychiatry = 'Psychiatry',
  Comprehensive = 'Comprehensive',
  Operative = 'Operative',
  DischargeSummary = 'DischargeSummary'
}

export interface Patient {
  id: string;
  mrn: string;
  patientId?: string;
  name: string; // Composite name for backward compatibility
  firstName?: string;
  lastName?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  sex?: 'Male' | 'Female' | 'Other'; // Alias for gender in new forms
  dob: string;
  dateOfBirth?: string; // Alias for dob
  noteTypePreference: NoteType;
  noteType?: string; // Alias for noteTypePreference
  weight?: number;
  height?: number;
  allergies: string[];
  conditions: string[];
  chronicConditions?: string[];
  lastVisit?: string;
}

export interface SOAPNote {
  id: string;
  patientId: string;
  date: string;
  type: NoteType;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isDraft: boolean;
}

export interface NoteContent {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  [key: string]: any;
}

export interface Note {
  id: string;
  patientId: string;
  title: string;
  type: string;
  noteType?: string;
  content: NoteContent;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed';
  isDraft: boolean;
  isLocalOnly: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface StreamChunk {
  text?: string;
  done: boolean;
  heartbeat?: boolean;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'note' | 'prompt';
  category: string;
  content: string | Record<string, any>;
  isUserCreated: boolean;
  createdAt?: string;
  lastModified?: string;
}

// --- Multi-Agent System Types ---

export enum TranslateLangType {
  ENGLISH = "English",
  THAI = "Thai"
}

export enum ActionType {
  PROCEED_WITH_PLANNING = "PROCEED_WITH_PLANNING",
  REQUEST_CLARIFICATION = "REQUEST_CLARIFICATION"
}

export enum TaskType {
  MEDICAL_DIAGNOSIS = "MEDICAL_DIAGNOSIS",
  COUPON_RECOMMENDATION = "COUPON_RECOMMENDATION"
}

export enum RoleType {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system"
}

export interface FrontendRequest {
  llm_provider: string;
  llm_model: string;
  session_id: string;
  system_prompt: string;
  user_prompt: string;
  language: string;
}

export interface ApiLlmResponseMessage {
  role: string;
  content: string;
  tool_calls?: any[];
}

export interface ApiLlmResponse {
  model: string;
  created_at: string;
  message: ApiLlmResponseMessage;
  done: boolean;
  done_reason: string;
}

export interface UserQueryInternal {
  session_id: string;
  original_user_content: string;
  additional_guidelines: string;
  language: string;
}

export interface PlanSubTask {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface PlanTask {
  name: string;
  description: string;
  reason: string;
  inputs: PlanSubTask[];
  outputs: PlanSubTask[];
  assigned_mini_agent_instance_id?: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'NeedsRefinement';
  result?: any;
  refinement_attempts: number;
}

export interface PlanModel {
  sub_tasks: PlanTask[];
}

export interface PlannerModel {
  Thought: string;
  Goal: string;
  Plan: PlanModel;
}

export interface PlaceholderReplacement {
  placeholder_to_find: string;
  value_to_replace_with: string;
}

export interface ToolInjection {
  placeholder_target_description: string;
  tool_list_to_inject: string[];
}

export interface CustomizationInstructions {
  placeholder_replacements: PlaceholderReplacement[];
  tool_injection?: ToolInjection;
}

export interface SelectedMiniAgent {
  blueprint_name: string;
  instance_name: string;
  customization_instructions: CustomizationInstructions;
}

export interface MiniAgentTeamConfiguration {
  selected_mini_agents: SelectedMiniAgent[];
  newly_specified_mini_agents: string[];
}

export interface AgentTeamConfiguration {
  Thought: string;
  Objective: string;
  MiniAgentTeamConfiguration: MiniAgentTeamConfiguration;
}

export interface AgentInstance {
  instance_id: string;
  blueprint_name: string;
  system_prompt: string;
  allowed_tools: string[];
}

export interface WorkFlowNode {
  node_id: string;
  assigned_mini_agent_instance_id: string;
  inputs_from_workflow: string[];
  outputs_to_workflow: string[];
}

export interface WorkFlowEdge {
  from_node: string;
  to_node: string;
  data_mapping: Record<string, string>;
}

export interface WorkFlow {
  workflow_id: string;
  user_goal_summary: string;
  global_context: Record<string, any>;
  nodes: WorkFlowNode[];
  edges: WorkFlowEdge[];
  sub_tasks_details: Record<string, PlanTask>;
  agent_instances: Record<string, AgentInstance>;
  current_task_node_id: string | null;
  max_refinement_cycles_per_task: number;
}

export interface RefinementGuideline {
  target_section: string;
  suggestion: string;
}

export interface RefinementPlan {
  analysis_summary: string;
  refinement_guidelines: RefinementGuideline[];
}

export interface AIMessage {
  content: string;
}

export interface IProvider {
  chat_completion(prompt: string, system_prompt: string, stream_handler?: any): Promise<AIMessage>;
  parse_json(response: AIMessage): any;
}
