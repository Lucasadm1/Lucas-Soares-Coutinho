

export interface ColorPalette {
  hex: string;
  name: string;
  percentage: string;
}

// New TechnicalSheet structure
export interface TechnicalSheet {
  identificacao_geral: {
    marca_fabricante: string;
    nome_produto: string;
    categoria_produto: string;
    identificacao_visual: string;
    contexto_definicao: string;
  };
  formula_e_conteudo: {
    tipo_formula: string;
    principais_compostos: string[];
    informacoes_quantitativas: {
      conteudo_ativo_principal: string;
      conteudo_coadjuvantes: string;
      quantidade_unidades: string;
      peso_liquido: string;
      forma_farmaceutica: string;
    };
    certificacoes_selos: string[];
  };
  engenharia_logistica: {
    altura_estimada: string;
    largura_estimada: string;
    profundidade_estimada: string;
    peso_estimado: string;
    tipo_recipiente: string;
    sistema_fechamento: string;
    informacoes_logisticas: string;
  };
  materiais_embalagem: {
    material_principal: string;
    acabamento_superficial: string;
    familia_material: string;
    componentes_secundarios: string;
    reciclabilidade: string;
  };
  analise_visual: {
    vibe: string;
    descricao_visual: string;
    publico_alvo: string;
  };
  paleta_cromatica: {
    cores_principais: Array<{
      nome: string;
      hex: string;
      proporcao: string;
    }>;
    analise_uso_cores: string;
  };
  resumo_e_limitacoes: {
    resumo_tecnico: string;
    limitacoes: string;
  };
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  data: TechnicalSheet | null;
}

// --- Compliance ---

export interface ComplianceContext {
  isNewProduct: boolean;
  launchDate: string;
  userNotes: string;
  includeNotesInReport: boolean;
}

export interface ComplianceCheckItem {
  item: string;
  status: 'CONFORME' | 'NAO_CONFORME' | 'NAO_IDENTIFICADO' | 'ALERTA';
  observation: string;
}

export interface FormulaCheck {
  item: string;
  status: 'DENTRO_DO_LIMITE' | 'ACIMA_DO_LIMITE' | 'DIVERGENTE' | 'DADOS_INSUFICIENTES';
  details: string;
}

export interface ClaimAnalysis {
  nutrientOrSubject: string;
  claimTextFound: string;
  classification: 'FUNCIONAL_RECONHECIDA' | 'SAUDE' | 'MARKETING_GENERICO' | 'NAO_RECONHECIDA';
  officialComparison: 'PLENAMENTE_RECONHECIDA' | 'DIVERGENTE_TEXTO' | 'DIVERGENTE_SENTIDO' | 'NAO_APLICAVEL';
  quantityCheck: 'ADEQUADA' | 'INSUFICIENTE' | 'NAO_VERIFICAVEL';
  observation: string;
}

export interface SanitaryRegularization {
  probableType: string;
  labelPhraseFound: string;
  coherence: 'COERENTE' | 'POSSIVELMENTE_DESATUALIZADO' | 'INADEQUADO' | 'INCERTO';
  transitionalSituations: string;
  regulatoryRiskComment: string;
  practicalRecommendations: string[];
}

export interface FinalOpinion {
  severityLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  summary: string;
  regulatoryRisks: string[];
  finalRecommendations: string[];
  legislationUsed: string[];
  regulatoryEnquadramento: string;
}

export interface ComplianceReport {
  productName: string;
  userNotes?: string;
  extraction: {
    transcribedText: string;
    visualElements: string[];
  };
  mandatoryChecks: ComplianceCheckItem[];
  prohibitedChecks: ComplianceCheckItem[];
  formulaAnalysis: FormulaCheck[];
  claimsAnalysis: ClaimAnalysis[];
  sanitaryRegularization: SanitaryRegularization;
  mandatoryComponentWarnings?: string[]; // Novo campo para Anexo VI
  technicalSuggestions: string[];
  finalOpinion: FinalOpinion;
}

// --- Chemical Analysis ---
export interface ChemicalIngredient {
  name: string;
  chemicalForm: string;
  isPhotosensitive: boolean;
  stabilityIssues: string;
  chemicalFunction: string;
  observation: string;
}

export interface ChemicalInteraction {
  compoundsinvolved: string;
  type: 'ANTAGONISMO' | 'SINERGISMO' | 'DEGRADACAO' | 'NEUTRO';
  description: string;
  severity: 'ALTA' | 'MEDIA' | 'BAIXA';
}

export interface PackagingCompatibility {
  containerType: string;
  suitability: 'ADEQUADO' | 'INADEQUADO' | 'ATENCAO';
  protectionAnalysis: {
    uvProtection: string;
    moistureProtection: string;
    interactionRisk: string;
  };
  recommendation: string;
}

export interface IngredientDecay {
  ingredientName: string;
  remainingPercentageAt12m: number;
  remainingPercentageAt24m: number;
}

export interface ShelfLifeForecast {
  at12Months: string;
  at24Months: string;
  overallStabilityVerdict: 'ESTAVEL' | 'MODERADO' | 'CRITICO';
  decayStats: IngredientDecay[];
}

export interface ChemicalAnalysisReport {
  productName: string;
  analysisDate: string;
  analysisParameters: string;
  bibliographicReferences: string[];
  ingredientsAnalysis: ChemicalIngredient[];
  interactions: ChemicalInteraction[];
  packagingCompatibility: PackagingCompatibility;
  optimalPH: string;
  storageRecommendations: string[];
  shelfLifeForecast: ShelfLifeForecast;
  improvements: string[];
  summary: string;
}

// --- FORMULADO 3.0 (Formulação Nutricional) ---

// Grupos conforme Anexo II da IN 75/2020
export type PopulationGroup = 
  | 'ADULTOS' // ≥ 19 anos
  | 'LACTENTES_0_6' // 0 a 6 meses
  | 'CRIANCAS_7_11' // 7 a 11 meses
  | 'CRIANCAS_1_3' // 1 a 3 anos
  | 'CRIANCAS_4_8' // 4 a 8 anos
  | 'CRIANCAS_9_18' // 9 a 18 anos
  | 'GESTANTES'
  | 'LACTANTES';

export type FormulationMode = 'EXISTING' | 'SCRATCH' | 'SYMPTOMS';
export type PharmaForm = 'CAPSULA' | 'COMPRIMIDO' | 'PO' | 'LIQUIDO' | 'GEL' | 'GOMAS';
export type MassUnit = 'g' | 'mg' | 'mcg';

// Tipos de Ingredientes expandidos conforme categorias da ANVISA
export type IngredientType = 
  | 'VITAMINA' 
  | 'MINERAL' 
  | 'AMINOACIDO' 
  | 'PROTEINA' 
  | 'CARBOIDRATO' 
  | 'FIBRA' 
  | 'LIPIDEO' 
  | 'ENZIMA' 
  | 'PROBIOTICO' 
  | 'BIOATIVO' 
  | 'OUTROS' 
  | 'ADITIVO' 
  | 'EXCIPIENTE';

export interface IngredientEntry {
  id: string;
  type: IngredientType;
  name: string;
  amount: string; // Valor numérico como string
  unit: MassUnit; // Unidade de medida
  function?: string; 
}

export interface IngredientLimit {
  min: string;
  max: string;
  unit: string;
  legalReference: string;
  observation: string;
}

export interface FormulationInput {
  // Configuração Inicial
  mode: FormulationMode;
  userNotes: string;

  // A. Sobre o Produto
  productName: string;
  category: string;
  purpose: string;
  
  // B. Forma Farmacêutica
  pharmaForm: PharmaForm;
  capsuleSize?: string;
  capsuleColor?: string;
  tabletDiameter?: string;
  tabletMassUnit?: string;
  
  // C. Ingredientes Estruturados
  structuredIngredients: IngredientEntry[];
  
  // D. Detalhes para "Do Zero"
  treatmentDuration?: string;
  targetDosesPerDay?: string;

  // E. Rotulagem
  allergens: string;
  gluten: 'CONTEM' | 'NAO_CONTEM';
  intendedClaims: string;
  
  // F. Especificações
  salesUnit: string;
  servingSize: string;
  frontalLabeling: boolean;
  populationGroup: PopulationGroup;
}

export interface NutritionalTableItem {
  nutrient: string;
  amountPer100: string;
  amountPerServing: string;
  vd: string;
}

export interface IngredientValidation {
  name: string;
  status: 'PERMITIDO' | 'PROIBIDO' | 'ATENCAO';
  observation: string;
}

export interface FormulationReport {
  reportDate: string;
  populationGroupUsed: string;
  
  suggestedFormula?: {
    ingredients: { name: string; amountPerDose: string; reason: string }[];
    dosesPerContainer: string;
    totalBatchWeight: string;
    capsuleFitAnalysis: string;
  };

  ingredientValidation: IngredientValidation[];
  
  nutritionalTable: {
    servingInfo: string;
    items: NutritionalTableItem[];
    footer: string;
  };
  
  formattedIngredientsList: string;
  allergensDeclaration: string;
  glutenDeclaration: string;
  claimsAnalysis: string[];
  frontalLabeling: {
    required: boolean;
    reason: string;
    iconType: string;
  };
  legalObservations: string[];
  mandatoryWarnings: string[];
}

// --- FORMULADOR POR SINTOMAS (INPUTS AVANÇADOS) ---

export interface PatientData {
  age: string;
  sex: 'masculino' | 'feminino' | 'outro';
  weightKg: string;
  isPregnantOrLactating: boolean;
  comorbidities: string[];
  dietaryRestrictions: string[];
}

export interface SymptomFormulationInput {
  selectedSymptoms: string[];
  patientData: PatientData;
  goals: string[];
  notes: string;
}

// --- FORMULADOR POR SINTOMAS (OUTPUTS AVANÇADOS) ---

export interface SuggestedNutrient {
  id_nutriente: string;
  nome: string;
  dose_diaria_sugerida: {
    valor: number;
    unidade: string;
  };
  faixa_referencia: {
    dose_min_base: number;
    dose_max_base: number;
    ajuste_legislacao_aplicado: boolean;
  };
  sintomas_que_justificam: string[];
  peso_de_relevancia: number;
  horario_recomendado: string;
  observacoes_para_formula: string;
}

export interface PharmaceuticalFormOutput {
  tipo: string;
  material_capsula: string;
  mg_totais_por_dia: number;
  mg_por_capsula: number;
  capsulas_por_dia: number;
  esquema_tomada: string;
}

export interface SymptomBasedReport {
  formula_final: {
    nutrientes_selecionados: SuggestedNutrient[];
    forma_farmaceutica: PharmaceuticalFormOutput;
    excipientes_sugeridos: string[];
  };
  relatorio_justificativas: {
    texto_resumido: string;
    texto_tecnico: string;
  };
  alertas_e_cuidados: {
    alertas_sobre_dose: string[];
    alertas_sobre_interacoes: string[];
    alertas_sobre_perfil_paciente: string[];
  };
}

// --- NUTRITABLE EXPERT TYPES ---

export interface NutriTableItemInput {
  nutrientName: string;
  value: number;
  unit: 'g' | 'mg' | 'mcg' | 'kcal';
  isBold?: boolean; // Para headers como "Carboidratos"
  indentation?: number; // 0, 1, 2 para subitens
}

export interface NutriTableGeneratorInput {
  servingSize: string; // Ex: "5g"
  servingDesc: string; // Ex: "1 scoop"
  servingsPerContainer: string;
  layout: 'VERTICAL' | 'LINEAR' | 'SIMPLIFIED'; // Novo campo para modelo
  populationGroup: PopulationGroup; // Novo campo para VDR
  items: NutriTableItemInput[];
}

export interface GeneratedTableOutput {
  htmlPreview: string; // HTML simples da tabela
  calculatedItems: {
    nutrient: string;
    amount: string; // Já arredondado
    vd: string; // Já calculado e arredondado
  }[];
  warnings: string[]; // Avisos sobre arredondamento aplicado ou inconsistência
}

export interface TableAuditResult {
  status: 'CONFORME' | 'DIVERGENTE' | 'CRITICO';
  servingFound: string;
  discrepancies: Array<{
    nutrient: string;
    declaredValue: string;
    declaredVD: string;
    calculatedVD: string;
    issue: string; // Descrição do erro (Ex: "VD incorreto, deveria ser 5%")
    severity: 'ALTA' | 'MEDIA' | 'BAIXA';
  }>;
  energyCheck: {
    declaredKcal: number;
    calculatedKcal: number;
    differencePercent: number;
    status: 'OK' | 'DIVERGENTE';
  };
  formattingIssues: string[]; // Ex: "Falta declaração de açúcares adicionados"
  generalConclusion: string;
}