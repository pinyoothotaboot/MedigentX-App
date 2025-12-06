
import { IProvider } from "./geminiService";
import { ProcessContext } from "./processContext";
import { Orchestrator } from "./orchestratorService";
import { Planner } from "./plannerService";
import { Architect } from "./architectService";
import { WorkFlowBuilder } from "./workflowBuilder";
import { WorkFlowExecutor } from "./workflowExecutor";
import { Consolidation } from "./consolidationService";
import { Translator } from "./translatorService";
import { ICD10Service } from "./icd10Service";
import { FrontendRequest, ApiLlmResponse, TaskType, RoleType, TranslateLangType, UserQueryInternal, ActionType } from "../types";
import { 
    ORCHESTRATOR_PROMPT_V1, STRATEGIC_PLANNING_PROMPT_V1, ARCHITECT_PROMPT_V1,
    OUTPUT_CONSOLIDATION_PROMPT_V1, ADAPTION_STRATEGIST_PROMPT_V1, PROMPT_BUILDER_PROMPT_V1,
    STANDARD_SOAP_INSTRUCTIONS_V1, SOAP_LIST_FORMAT_INSTRUCTIONS_V1, 
    SOAP_NARRATIVE_FORMAT_INSTRUCTIONS_V1, COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1,
    PSYCHIATRY_NOTE_INSTRUCTIONS_V1, DISCHARGE_SUMMARY_INSTRUCTIONS_V1, OPERATIVE_NOTE_INSTRUCTIONS_V1,
    MEDICAL_NOTE_MASTER_PROMPT_V1, VERIFICATION_MINI_AGENT_BLUEPRINT_V1
} from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[MANAGER] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[MANAGER:ERROR] ${msg}`, ...args),
};

export class Manager {
  private llmProvider: IProvider;
  private processContext: ProcessContext;
  private orchestrator: Orchestrator;
  private planner: Planner;
  private architect: Architect;
  private workflowBuilder: WorkFlowBuilder;
  private workflowExecutor: WorkFlowExecutor;
  private consolidation: Consolidation;
  private translator: Translator;
  private tools: { icd10: ICD10Service };
  private blueprints: Record<string, string> = {};

  constructor(llmProvider: IProvider, streamHandler?: (msg: string) => void) {
    this.llmProvider = llmProvider;
    this.processContext = new ProcessContext(streamHandler);
    
    this.orchestrator = new Orchestrator(ORCHESTRATOR_PROMPT_V1);
    this.planner = new Planner(STRATEGIC_PLANNING_PROMPT_V1);
    this.architect = new Architect(ARCHITECT_PROMPT_V1);
    this.workflowBuilder = new WorkFlowBuilder();
    this.consolidation = new Consolidation(OUTPUT_CONSOLIDATION_PROMPT_V1);
    this.translator = new Translator();
    
    this.tools = { icd10: new ICD10Service() };
    
    this.workflowExecutor = new WorkFlowExecutor(
        ADAPTION_STRATEGIST_PROMPT_V1,
        PROMPT_BUILDER_PROMPT_V1,
        this.tools.icd10
    );

    this.initializeBlueprints();
  }

  private initializeBlueprints() {
    this.blueprints["StrategicPlanningMiniAgent_Blueprint"] = STRATEGIC_PLANNING_PROMPT_V1;
    this.blueprints["AgentSpecificationMiniAgent_Blueprint"] = ARCHITECT_PROMPT_V1;
    // this.blueprints["CodeCrafterMiniAgent_Blueprint"] = CODING_MINI_AGENT_BLUEPRINT_V1; // Need definition or remove
    this.blueprints["VerificationMiniAgent_Blueprint"] = VERIFICATION_MINI_AGENT_BLUEPRINT_V1;
    this.blueprints["OutputConsolidationMiniAgent_Blueprint"] = OUTPUT_CONSOLIDATION_PROMPT_V1;
    
    this.blueprints["MedicalNoteGenerator_Blueprint"] = MEDICAL_NOTE_MASTER_PROMPT_V1;
    this.blueprints["MedicalStandardSoapNoteGenerator_Blueprint"] = STANDARD_SOAP_INSTRUCTIONS_V1;
    this.blueprints["MedicalSoapListFormatGenerator_Blueprint"] = SOAP_LIST_FORMAT_INSTRUCTIONS_V1;
    this.blueprints["MedicalSoapNarrativeGenerator_Blueprint"] = SOAP_NARRATIVE_FORMAT_INSTRUCTIONS_V1;
    this.blueprints["MedicalComprehensiveNoteGenerator_Blueprint"] = COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1;
    this.blueprints["MedicalPsychiatricNoteGenerator_Blueprint"] = PSYCHIATRY_NOTE_INSTRUCTIONS_V1;
    this.blueprints["MedicalDischargeSummaryGenerator_Blueprint"] = DISCHARGE_SUMMARY_INSTRUCTIONS_V1;
    this.blueprints["MedicalOperativeNoteGenerator_Blueprint"] = OPERATIVE_NOTE_INSTRUCTIONS_V1;
  }

  private parseNoteType(systemPrompt: string): string {
    if (systemPrompt.includes("NOTE_TYPE::StandardSOAP")) return STANDARD_SOAP_INSTRUCTIONS_V1;
    if (systemPrompt.includes("NOTE_TYPE::SOAPList")) return SOAP_LIST_FORMAT_INSTRUCTIONS_V1;
    if (systemPrompt.includes("NOTE_TYPE::Psychiatry")) return PSYCHIATRY_NOTE_INSTRUCTIONS_V1;
    if (systemPrompt.includes("NOTE_TYPE::OperativeNote")) return OPERATIVE_NOTE_INSTRUCTIONS_V1;
    if (systemPrompt.includes("NOTE_TYPE::DischargeSummary")) return DISCHARGE_SUMMARY_INSTRUCTIONS_V1;
    if (systemPrompt.includes("NOTE_TYPE::Comprehensive")) return COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1;
    return systemPrompt;
  }

  public async process(request: FrontendRequest): Promise<ApiLlmResponse> {
    try {
        let userContent = request.user_prompt;
        
        // 1. Translation (Input)
        if (request.language === TranslateLangType.THAI) {
            this.processContext.update("Translating input...");
            userContent = await this.translator.translate(userContent, this.llmProvider, TranslateLangType.ENGLISH, true);
        }

        const additionalGuidelines = this.parseNoteType(request.system_prompt);
        const internalQuery: UserQueryInternal = {
            session_id: request.session_id,
            original_user_content: userContent,
            additional_guidelines: additionalGuidelines,
            language: request.language
        };

        // 2. Goal Analysis
        this.processContext.update("Analyzing goal...");
        const analysis = await this.orchestrator.processGoalIngestionAndAnalysis(internalQuery, this.llmProvider);
        
        const nextAction = analysis.next_action || ActionType.PROCEED_WITH_PLANNING;
        if (nextAction === ActionType.REQUEST_CLARIFICATION) {
             return {
                model: request.llm_model,
                created_at: new Date().toISOString(),
                message: { role: RoleType.ASSISTANT, content: analysis.clarification_question || "Can you clarify?" },
                done: false,
                done_reason: "needs_input"
             };
        }

        // 3. Planning
        this.processContext.update("Planning tasks...");
        const plannerModel = await this.planner.planPerformSubTasks(internalQuery, this.llmProvider);
        if (!plannerModel) throw new Error("Planning failed");

        // 4. Architect (Team Assembly)
        this.processContext.update("Assembling team...");
        const [subTasks, agentInstances] = await this.architect.processPerformTeamAssembly(
            this.llmProvider, plannerModel, Object.keys(this.tools), this.blueprints
        );

        // 5. Workflow Building
        this.processContext.update("Building workflow...");
        let workflow = this.workflowBuilder.createWorkflowStructure(
            internalQuery.original_user_content, subTasks, agentInstances
        );

        // 6. Execution
        this.processContext.update("Executing workflow...");
        workflow = await this.workflowExecutor.execute(workflow, this.llmProvider);

        // 7. Consolidation
        this.processContext.update("Consolidating results...");
        let finalOutput = await this.consolidation.performOutputConsolidation(this.llmProvider, workflow);

        // 8. Translation (Output)
        if (request.language === TranslateLangType.THAI) {
            this.processContext.update("Translating output...");
            finalOutput = await this.translator.translate(finalOutput, this.llmProvider, request.language);
        }

        this.processContext.update("Completed.");

        return {
            model: request.llm_model,
            created_at: new Date().toISOString(),
            message: { role: RoleType.ASSISTANT, content: finalOutput },
            done: true,
            done_reason: "completed"
        };

    } catch (e) {
        logger.error("Processing failed", e);
        return {
            model: request.llm_model,
            created_at: new Date().toISOString(),
            message: { role: RoleType.ASSISTANT, content: "Error processing request." },
            done: true,
            done_reason: "error"
        };
    }
  }
}
