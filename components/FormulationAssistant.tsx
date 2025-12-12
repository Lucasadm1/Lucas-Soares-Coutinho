import React, { useState, useEffect } from 'react';
import { generateFormulationAnalysis, checkIngredientLimits } from '../services/geminiService';
import { FormulationInput, FormulationReport, PopulationGroup, FormulationMode, PharmaForm, IngredientEntry, MassUnit, IngredientLimit, IngredientType } from '../types';
import SymptomFormulator from './SymptomFormulator';

// --- CONSTANTES & LISTAS ---

const CAPSULE_SIZES = [
  { size: "000", capacityMg: "~1000-1300mg" },
  { size: "00", capacityMg: "~750-950mg" },
  { size: "0", capacityMg: "~550-700mg" },
  { size: "1", capacityMg: "~400-500mg" },
  { size: "2", capacityMg: "~300-400mg" },
  { size: "3", capacityMg: "~200-300mg" },
  { size: "4", capacityMg: "~150-200mg" }
];

const CATEGORIES_OPTIONS = ["Suplemento Alimentar (RDC 243/2018)", "Mistura para preparo de alimento", "Bebida não alcoólica", "Alimento para Atletas"];

// --- BASES DE DADOS DE INGREDIENTES (IN 28/2018 - ATUALIZADA) ---
// (Mantendo as mesmas constantes de listas PEDIATRIC_INGREDIENTS_DB e GENERAL_INGREDIENTS_DB do código original, sem alterações na lógica)
const GENERAL_INGREDIENTS_DB: Record<string, string[]> = {
  "VITAMINA": [
    "Ácido fólico", "L-metilfolato de cálcio", "L-metilfolato de glicosamina",
    "Ácido pantotênico (D-pantotenato de cálcio)", "Pantenol",
    "Biotina (D-biotina)",
    "Colina (Bitartarato)", "Colina (Cloreto)",
    "Niacina (Nicotinamida)", "Niacina (Ácido nicotínico)",
    "Vitamina A (Acetato de retinol)", "Vitamina A (Palmitato de retinol)", "Betacaroteno",
    "Vitamina B1 (Cloridrato de tiamina)", "Vitamina B1 (Nitrato de tiamina)",
    "Vitamina B2 (Riboflavina)", "Vitamina B2 (Riboflavina-5'-fosfato de sódio)",
    "Vitamina B6 (Cloridrato de piridoxina)", "Vitamina B6 (Fosfato de piridoxal)",
    "Vitamina B12 (Cianocobalamina)", "Vitamina B12 (Metilcobalamina)", "Vitamina B12 (Hidroxocobalamina)",
    "Vitamina C (Ácido ascórbico)", "Vitamina C (Ascorbato de cálcio)", "Vitamina C (Ascorbato de sódio)", "Vitamina C (Palmitato de ascorbila)", "Acerola em pó",
    "Vitamina D3 (Colecalciferol)", "Vitamina D2 (Ergocalciferol)", "Calcidiol (Saccharomyces cerevisiae)",
    "Vitamina E (Acetato de DL-alfa-tocoferol)", "Vitamina E (D-alfa-tocoferol)", "Vitamina E (Mix de tocoferóis)",
    "Vitamina K1 (Fitomenadiona)", "Vitamina K2 (Menaquinona-7)"
  ],
  "MINERAL": [
    "Cálcio (Carbonato)", "Cálcio (Citrato Malato)", "Cálcio (Bisglicinato)", "Cálcio (Fosfato Tricálcico)", "Cálcio (Dolomita)", "Cálcio (Lithothamnion)",
    "Magnésio (Óxido)", "Magnésio (Bisglicinato)", "Magnésio (Dimalato)", "Magnésio (Citrato)", "Magnésio (Cloreto)", "Magnésio (Taurato)",
    "Ferro (Bisglicinato)", "Ferro (Sulfato)", "Ferro (Fumarato)", "Ferro (Polimaltosado)", "Ferro Carbonila",
    "Zinco (Bisglicinato)", "Zinco (Óxido)", "Zinco (Sulfato)", "Zinco (Gluconato)",
    "Selênio (L-Selenometionina)", "Selênio (Selenito de Sódio)", "Levedura de Selênio",
    "Cromo (Picolinato)", 
    "Cobre (Bisglicinato)", "Cobre (Sulfato)", "Cobre (Gluconato)",
    "Iodo (Iodeto de Potássio)", 
    "Manganês (Sulfato)", "Manganês (Bisglicinato)",
    "Potássio (Cloreto)", "Potássio (Citrato)",
    "Boro (Tetraborato de sódio)", "Silício (Ácido ortosilícico)"
  ],
  "AMINOACIDO": [
    "L-Glutamina", "L-Arginina", "L-Leucina", "L-Isoleucina", "L-Valina", "BCAA",
    "Creatina Monohidratada", "Beta-Alanina", "L-Carnitina (L-Tartarato)", "Taurina", 
    "L-Triptofano", "L-Tirosina", "L-Cisteína (NAC)", "Glicina", "L-Lisina", "L-Metionina", 
    "L-Teanina", "L-Histidina", "L-Fenilalanina", "L-Prolina", "L-Serina", "L-Treonina",
    "Ácido Aspártico", "Ácido Glutâmico"
  ],
  "PROTEINA": [
    "Caseína", "Caseinato de cálcio", "Clara de ovo desidratada", "Colágeno Tipo II", "Colágeno Hidrolisado", 
    "Espirulina (Arthrospira platensis)", "Gelatina", "Proteína de soja isolada", "Proteína de soro do leite (Whey Concentrado)", 
    "Proteína de soro do leite (Whey Isolado)", "Proteína de soro do leite (Whey Hidrolisado)", 
    "Proteína de ervilha", "Proteína de arroz", "Proteína de fava", "Proteína de girassol", "Proteína de carne bovina hidrolisada"
  ],
  "CARBOIDRATO": [
    "Amido de milho", "Dextrose (D-Glucose)", "Frutose", "Lactose", "Maltodextrina", "Sacarose", 
    "Isomaltulose (Palatinose)", "D-Ribose", "Waxy Maize", "Mel"
  ],
  "FIBRA": [
    "Inulina", "Pectina", "Polidextrose", "Psyllium (Plantago ovatae)", "Goma Guar", "Goma Acácia", 
    "Frutooligossacarídeos (FOS)", "Galactooligossacarídeos (GOS)", "Beta-glucana de levedura", 
    "Amido Resistente", "Fibras Cítricas", "2'-Fucosil-lactose", "Arabinogalactana", "Fibra de Aveia", "Fibra de Maçã"
  ],
  "LIPIDEO": [
    "Ácido Linoleico (Ômega 6)", "Ácido Alfa-Linolênico (Ômega 3)", "DHA (Óleo de peixe/algas)", 
    "EPA (Óleo de peixe)", "MCT (Triglicerídeos de Cadeia Média)", "Óleo de Borragem", "Óleo de Prímula", 
    "Óleo de Linhaça", "Óleo de Coco", "Óleo de Krill", "Fosfatidilserina", "Lecitina", "Óleo de Cártamo"
  ],
  "SUBSTANCIA_BIOATIVA": [
    "Cafeína Anidra", "Coenzima Q10", "Ácido Hialurônico", "MSM (Metilsulfonilmetano)", 
    "Luteína (Tagetes erecta)", "Zeaxantina", "Astaxantina", "Licopeno", 
    "Ácido Clorogênico (Café Verde)", "Compostos Fenólicos (Própolis)", "Curcumina (Cúrcuma)", 
    "Resveratrol", "Proantocianidinas (Cranberry)", "Melatonina", "Glucosamina", "Condroitina",
    "Rutina", "Alicina (Alho)", "10-HDA (Geleia Real)", "GABA", "Lactoferrina", "Antocianinas (Laranja Moro)",
    "D-Limoneno", "Hidroxitirosol (Oliva)"
  ],
  "ENZIMA": [
    "Lactase (Aspergillus oryzae)", "Fitase (Aspergillus niger)", "Protease", "Alfa-galactosidase"
  ],
  "PROBIOTICO": [
    "Lactobacillus acidophilus NCFM", "Lactobacillus rhamnosus GG", "Bifidobacterium animalis subsp. lactis HN019", 
    "Bifidobacterium animalis subsp. lactis BB-12", "Lactobacillus casei", "Bacillus coagulans", 
    "Lactobacillus reuteri", "Bacillus clausii", "Bifidobacterium longum", "Lactobacillus plantarum", "Lactobacillus helveticus"
  ],
  "OUTROS_NUTRIENTES": [
    "Adenosina", "Inositol"
  ],
  "ADITIVO": [
    "Ácido Cítrico (Acidulante)", "Dióxido de Titânio (Corante)", "Sorbato de Potássio (Conservante)", 
    "Benzoato de Sódio (Conservante)", "Sucralose (Edulcorante)", "Stevia (Edulcorante)", 
    "Aroma Idêntico ao Natural", "Lecitina de Soja (Emulsificante)", "Goma Xantana (Espessante)"
  ],
  "EXCIPIENTE": [
    "Celulose Microcristalina (Diluente)", "Amido de Milho (Diluente)", "Estearato de Magnésio (Lubrificante)",
    "Dióxido de Silício (Antiumectante)", "Talco Farmacêutico (Deslizante)", "Carbonato de Cálcio (Diluente)"
  ]
};

const PEDIATRIC_INGREDIENTS_DB: Record<string, string[]> = {
  "PROTEINA": [
    "Proteína concentrada de leite (bovino)", "Proteína isolada de leite (bovino)", "Proteína hidrolisada do soro do leite"
  ],
  "CARBOIDRATO": [
    "Lactose", "Maltodextrina", "Amido de milho pré-gelatinizado", "Xarope de glicose"
  ],
  "MINERAL": [
    "Carbonato de Cálcio", "Citrato de Cálcio", "Fosfato Tricálcico", "Glicerofosfato de Cálcio", "Gluconato de Cálcio",
    "Bisglicinato Ferroso", "Fumarato Ferroso", "Sulfato Ferroso", "Citrato Férrico",
    "Sulfato de Zinco", "Gluconato de Zinco", "Acetato de Zinco", "Óxido de Zinco",
    "Iodeto de Potássio", "Selenito de Sódio", "Gluconato de Cobre", "Sulfato Cúprico",
    "Cloreto de Magnésio", "Óxido de Magnésio", "Sulfato de Magnésio"
  ],
  "VITAMINA": [
    "Vitamina A (Acetato de Retinol)", "Vitamina A (Palmitato de Retinol)", "Betacaroteno",
    "Vitamina D3 (Colecalciferol)", "Vitamina D2 (Ergocalciferol)",
    "Vitamina E (Acetato de DL-alfa-tocoferol)", "Vitamina E (D-alfa-tocoferol)",
    "Vitamina K1 (Fitomenadiona)",
    "Vitamina C (Ácido Ascórbico)", "Vitamina C (Ascorbato de Sódio)", "Vitamina C (Palmitato de Ascorbila)",
    "Vitamina B1 (Cloridrato de Tiamina)", "Vitamina B1 (Mononitrato)",
    "Vitamina B2 (Riboflavina)", 
    "Vitamina B3 (Niacinamida)", 
    "Vitamina B5 (Pantotenato de Cálcio)", 
    "Vitamina B6 (Cloridrato de Piridoxina)", 
    "Vitamina B7 (Biotina)", 
    "Vitamina B9 (Ácido Fólico)", "Vitamina B9 (L-Metilfolato de Cálcio)", 
    "Vitamina B12 (Cianocobalamina)", "Vitamina B12 (Hidroxocobalamina)"
  ],
  "OUTROS_NUTRIENTES": [
    "Inositol", "Colina (Bitartarato)", "Colina (Cloreto)", "Taurina", "L-Carnitina", 
    "DHA (Óleo de peixe/algas)", "ARA (Ácido Araquidônico)", "Nucleotídeos"
  ],
  "PROBIOTICO": [
    "Bifidobacterium animalis subsp. lactis BB-12", "Lactobacillus rhamnosus GG", "Lactobacillus reuteri DSM 17938"
  ],
  "SUBSTANCIA_BIOATIVA": [], // Geralmente restritos
  "AMINOACIDO": ["L-Arginina", "L-Histidina", "L-Cisteína"], 
  "ADITIVO": ["Ácido Cítrico (Acidulante)", "Lecitina (Emulsificante)", "Goma Guar"],
  "EXCIPIENTE": ["Amido", "Maltodextrina"]
};

const FormulationAssistant: React.FC = () => {
  // --- STATE ---
  const [step, setStep] = useState<'MODE_SELECT' | 'FORM' | 'REPORT'>('MODE_SELECT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<FormulationReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Estados para Seleção Hierárquica de Ingredientes
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedIngredientName, setSelectedIngredientName] = useState<string>("");

  // Estados para o Balão Flutuante de Limites
  const [activeLimits, setActiveLimits] = useState<Record<string, IngredientLimit | 'LOADING'>>({});

  const [input, setInput] = useState<FormulationInput>({
    mode: 'EXISTING',
    userNotes: '',
    productName: '',
    category: '',
    purpose: '',
    pharmaForm: 'CAPSULA',
    capsuleSize: '00',
    capsuleColor: '',
    tabletDiameter: '',
    tabletMassUnit: 'mg',
    structuredIngredients: [],
    treatmentDuration: '30',
    targetDosesPerDay: '1',
    allergens: '',
    gluten: 'NAO_CONTEM',
    intendedClaims: '',
    salesUnit: '',
    servingSize: '',
    frontalLabeling: false,
    populationGroup: 'ADULTOS'
  });

  // Identificar se é grupo sensível (Lactentes/Crianças < 3 anos)
  const isPediatricGroup = ['LACTENTES_0_6', 'CRIANCAS_7_11', 'CRIANCAS_1_3'].includes(input.populationGroup);
  
  // Selecionar a Base de Dados correta
  const currentIngredientsDB = isPediatricGroup ? PEDIATRIC_INGREDIENTS_DB : GENERAL_INGREDIENTS_DB;

  // --- HANDLERS ---
  const handleModeSelect = (mode: FormulationMode) => {
    setInput(prev => ({ ...prev, mode }));
    setStep('FORM');
  };

  const updateInput = (field: keyof FormulationInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleGroupChange = (group: PopulationGroup) => {
    const isSensitive = ['LACTENTES_0_6', 'CRIANCAS_7_11', 'CRIANCAS_1_3'].includes(group);
    
    if (isSensitive) {
      alert("MODO PEDIÁTRICO ATIVADO: A lista de ingredientes foi restrita conforme o ANEXO II da IN 28/2018 para Lactentes e Crianças de Primeira Infância.");
    }
    
    updateInput('populationGroup', group);
    setActiveLimits({});
    // Resetar seleção ao mudar grupo
    setSelectedCategory("");
    setSelectedIngredientName("");
  };

  // --- INGREDIENT ADDITION (HIERARCHICAL) ---
  const handleAddIngredient = () => {
    if (!selectedCategory || !selectedIngredientName) return;

    const typeMapping: Record<string, IngredientType> = {
      "VITAMINA": 'VITAMINA', "MINERAL": 'MINERAL', "AMINOACIDO": 'AMINOACIDO',
      "PROTEINA": 'PROTEINA', "CARBOIDRATO": 'CARBOIDRATO', "FIBRA": 'FIBRA',
      "LIPIDEO": 'LIPIDEO', "ENZIMA": 'ENZIMA', "PROBIOTICO": 'PROBIOTICO',
      "SUBSTANCIA_BIOATIVA": 'BIOATIVO', "ADITIVO": 'ADITIVO', "EXCIPIENTE": 'EXCIPIENTE',
      "OUTROS_NUTRIENTES": 'OUTROS'
    };

    const newId = Date.now().toString();
    const newIngredient: IngredientEntry = {
      id: newId,
      type: typeMapping[selectedCategory] || 'OUTROS',
      name: selectedIngredientName,
      amount: '',
      unit: 'mg'
    };

    setInput(prev => ({
      ...prev,
      structuredIngredients: [...prev.structuredIngredients, newIngredient]
    }));

    // Reset fields
    setSelectedIngredientName("");
    // Check limit immediately
    handleCheckLimit(newId, selectedIngredientName);
  };

  const removeIngredient = (id: string) => {
    setInput(prev => ({
      ...prev,
      structuredIngredients: prev.structuredIngredients.filter(i => i.id !== id)
    }));
    const newLimits = { ...activeLimits };
    delete newLimits[id];
    setActiveLimits(newLimits);
  };

  const updateIngredient = (id: string, field: keyof IngredientEntry, value: string) => {
    setInput(prev => ({
      ...prev,
      structuredIngredients: prev.structuredIngredients.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  // --- LIMIT CHECKER ---
  const handleCheckLimit = async (ingredientId: string, name: string) => {
    if (!name || name.trim().length < 3) return;
    setActiveLimits(prev => ({ ...prev, [ingredientId]: 'LOADING' }));
    try {
        const limitInfo = await checkIngredientLimits(name, input.populationGroup);
        setActiveLimits(prev => ({ ...prev, [ingredientId]: limitInfo }));
    } catch (e) {
        setActiveLimits(prev => ({ ...prev, [ingredientId]: {
            min: "-", max: "-", unit: "-", legalReference: "Indisponível", observation: "Tente novamente"
        }}));
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!input.productName || input.structuredIngredients.length === 0) {
      alert("Preencha o Nome do Produto e adicione pelo menos um ingrediente.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateFormulationAnalysis(input);
      setReport(result);
      setStep('REPORT');
    } catch (err: any) {
      let errorMsg = err.message || "Erro ao gerar formulação.";
      const errorString = JSON.stringify(err);
      if (errorString.includes("429") || errorMsg.includes("429")) {
         errorMsg = "⚠️ Cota da API excedida. Aguarde um momento e tente novamente.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const element = document.getElementById('formulation-report-content');
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Formulacao_${input.productName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      // @ts-ignore
      if (window.html2pdf) await window.html2pdf().set(options).from(element).save();
      else window.print();
    } catch (error) {
      console.error(error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const getIndentationClass = (nutrientName: string): string => {
    const lowerName = nutrientName.toLowerCase();
    if (lowerName.includes('saturadas') || lowerName.includes('trans') || lowerName.includes('monoinsaturadas') || lowerName.includes('poli-insaturadas') || lowerName.includes('adicionados') || lowerName.includes('polióis')) {
        return 'pl-4'; 
    }
    if (lowerName.includes('oléico') || lowerName.includes('linoléico')) {
        return 'pl-8'; 
    }
    return '';
  };

  const getCategoryBadgeColor = (cat: string) => {
    if (cat === 'VITAMINA') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (cat === 'MINERAL') return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (cat === 'BIOATIVO' || cat === 'SUBSTANCIA_BIOATIVA') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (cat === 'PROBIOTICO' || cat === 'ENZIMA') return 'bg-pink-100 text-pink-800 border-pink-200';
    if (cat === 'ADITIVO' || cat === 'EXCIPIENTE') return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  // --- RENDERERS ---
  
  if (input.mode === 'SYMPTOMS') {
    return <SymptomFormulator onBack={() => setStep('MODE_SELECT')} />;
  }
  
  if (step === 'MODE_SELECT') {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">FORMULADO 3.0</h1>
          <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">Escolha o motor de inteligência ideal para o seu projeto de desenvolvimento.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Existing */}
          <div onClick={() => handleModeSelect('EXISTING')} className="group relative bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-brand-300"></div>
            <div className="mb-6 relative z-10">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-3xl text-brand-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <i className="fa-solid fa-file-contract"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">Validação de Fórmula</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Já possuo os ingredientes e doses. Preciso gerar a Tabela Nutricional (%VD) e validar conformidade com a IN 28/2018.</p>
            </div>
            <div className="absolute bottom-0 right-0 opacity-5 text-9xl text-brand-600 transform translate-x-1/4 translate-y-1/4 transition-transform group-hover:scale-110">
               <i className="fa-solid fa-file-contract"></i>
            </div>
          </div>
          
          {/* Card 2: Scratch */}
          <div onClick={() => handleModeSelect('SCRATCH')} className="group relative bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400"></div>
            <div className="mb-6 relative z-10">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">Criar do Zero</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Tenho apenas o objetivo (ex: "Imunidade"). Quero sugestão de doses eficazes, balanceamento e cálculo farmacotécnico.</p>
            </div>
            <div className="absolute bottom-0 right-0 opacity-5 text-9xl text-purple-600 transform translate-x-1/4 translate-y-1/4 transition-transform group-hover:scale-110">
               <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
          </div>

          {/* Card 3: Symptoms */}
          <div onClick={() => handleModeSelect('SYMPTOMS')} className="group relative bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-accent-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 to-emerald-400"></div>
            <div className="mb-6 relative z-10">
              <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center text-3xl text-accent-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">Formulador Clínico</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Partir de sintomas e perfil do paciente. O sistema sugere uma fórmula personalizada baseada em matriz nutricional.</p>
            </div>
            <div className="absolute bottom-0 right-0 opacity-5 text-9xl text-accent-600 transform translate-x-1/4 translate-y-1/4 transition-transform group-hover:scale-110">
               <i className="fa-solid fa-user-doctor"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'FORM') {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-12">
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <button onClick={() => setStep('MODE_SELECT')} className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-2"><i className="fa-solid fa-arrow-left"></i> Voltar ao Menu</button>
           <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
             Modo: {input.mode === 'EXISTING' ? 'Validação de Fórmula' : 'Criação P&D'}
           </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
           {/* Header Contexto */}
           <div className="bg-slate-50/80 p-8 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 ml-1">
                 <i className="fa-solid fa-lightbulb text-amber-400 mr-2"></i> Contexto Adicional para IA
              </label>
              <textarea 
                value={input.userNotes} 
                onChange={(e) => updateInput('userNotes', e.target.value)} 
                placeholder="Descreva detalhes específicos, público-alvo ou restrições..." 
                className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none h-24 bg-white shadow-sm transition-all" 
              />
           </div>

           <div className="p-8 space-y-10">
              
              {/* SEÇÃO 1: DADOS BÁSICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nome do Produto</label>
                    <input 
                      type="text" 
                      value={input.productName} 
                      onChange={(e) => updateInput('productName', e.target.value)} 
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-semibold text-slate-800 bg-slate-50/50" 
                      placeholder="Ex: Polivitamínico AZ" 
                    />
                 </div>
                 {input.mode === 'SCRATCH' ? (
                    <div>
                       <label className="block text-xs font-bold text-purple-600 uppercase mb-2 ml-1">Objetivo Principal</label>
                       <input 
                         type="text" 
                         value={input.purpose} 
                         onChange={(e) => updateInput('purpose', e.target.value)} 
                         className="w-full p-3 border border-purple-200 bg-purple-50/30 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-purple-900 font-medium" 
                         placeholder="Ex: Ganho de Massa, Foco, Imunidade..." 
                       />
                    </div>
                 ) : (
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Categoria</label>
                       <input 
                         type="text" 
                         list="category-options" 
                         value={input.category} 
                         onChange={(e) => updateInput('category', e.target.value)} 
                         className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50" 
                         placeholder="Selecione..." 
                       />
                       <datalist id="category-options">{CATEGORIES_OPTIONS.map((opt, i) => <option key={i} value={opt} />)}</datalist>
                    </div>
                 )}
              </div>

              {/* SEÇÃO 2: GRUPO POPULACIONAL */}
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                 <label className="block text-xs font-bold text-amber-800 uppercase mb-2 ml-1">Grupo Populacional (Base Legal)</label>
                 <select 
                    value={input.populationGroup} 
                    onChange={(e) => handleGroupChange(e.target.value as PopulationGroup)} 
                    className="w-full p-3 border border-amber-200 rounded-xl text-sm bg-white font-bold text-amber-900 focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
                 >
                    <option value="ADULTOS">Adultos (≥ 19 anos)</option>
                    <option value="LACTENTES_0_6">Lactentes (0 a 6 meses)</option>
                    <option value="CRIANCAS_7_11">Crianças (7 a 11 meses)</option>
                    <option value="CRIANCAS_1_3">Crianças (1 a 3 anos)</option>
                    <option value="CRIANCAS_4_8">Crianças (4 a 8 anos)</option>
                    <option value="CRIANCAS_9_18">Crianças (9 a 18 anos)</option>
                    <option value="GESTANTES">Gestantes</option>
                    <option value="LACTANTES">Lactantes</option>
                 </select>
                 {isPediatricGroup && (
                    <div className="flex items-center gap-2 mt-3 text-amber-700 bg-amber-100/50 p-2 rounded-lg inline-block">
                       <i className="fa-solid fa-child text-sm"></i> 
                       <span className="text-xs font-bold">Modo Pediátrico: Lista de ingredientes restrita ao Anexo II (IN 28).</span>
                    </div>
                 )}
              </div>

              {/* SEÇÃO 3: INGREDIENTES */}
              <div>
                 <div className="mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
                       <span className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-sm"><i className="fa-solid fa-flask"></i></span>
                       Composição da Fórmula
                    </h3>
                    
                    {/* SELETOR HIERÁRQUICO */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end shadow-inner">
                       <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">1. Categoria</label>
                          <select 
                             value={selectedCategory} 
                             onChange={(e) => { setSelectedCategory(e.target.value); setSelectedIngredientName(""); }}
                             className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:border-brand-500 outline-none"
                          >
                             <option value="">-- Selecione --</option>
                             {Object.keys(currentIngredientsDB).map(cat => (
                                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                             ))}
                          </select>
                       </div>

                       <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">2. Ingrediente</label>
                          <select 
                             value={selectedIngredientName} 
                             onChange={(e) => setSelectedIngredientName(e.target.value)}
                             disabled={!selectedCategory}
                             className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:border-brand-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                          >
                             <option value="">{selectedCategory ? "-- Selecione o item --" : "Aguardando categoria..."}</option>
                             {currentIngredientsDB[selectedCategory]?.sort().map((ing, idx) => (
                                <option key={idx} value={ing}>{ing}</option>
                             ))}
                          </select>
                       </div>

                       <button 
                          onClick={handleAddIngredient}
                          disabled={!selectedCategory || !selectedIngredientName}
                          className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md h-[42px]
                             ${!selectedCategory || !selectedIngredientName 
                                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                                : 'bg-brand-600 hover:bg-brand-500 hover:shadow-lg transform hover:-translate-y-0.5'}
                          `}
                       >
                          Adicionar
                       </button>
                    </div>
                 </div>
                 
                 {input.structuredIngredients.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
                       <div className="text-slate-300 text-4xl mb-3"><i className="fa-solid fa-box-open"></i></div>
                       <p className="text-slate-500 text-sm font-medium">Nenhuma matéria-prima adicionada.</p>
                       <p className="text-slate-400 text-xs">Utilize o seletor acima para compor sua fórmula.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {input.structuredIngredients.map((ing, index) => (
                          <div key={ing.id} className="relative flex flex-col sm:flex-row gap-3 items-center bg-white p-4 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                             <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="w-6 text-center text-xs font-bold text-slate-300 group-hover:text-brand-400 transition-colors">{index + 1}</span>
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg w-28 text-center border ${getCategoryBadgeColor(ing.type)} border-opacity-40`}>
                                    {ing.type}
                                </span>
                             </div>

                             {/* Input Nome */}
                             <div className="relative flex-1 w-full sm:w-auto">
                                <input 
                                  type="text" 
                                  value={ing.name} 
                                  readOnly
                                  className="w-full p-2.5 border border-slate-100 bg-slate-50/50 rounded-lg text-sm font-medium text-slate-700 outline-none"
                                />
                                
                                {/* BALÃO DE LIMITES */}
                                {activeLimits[ing.id] && (
                                   <div className="absolute z-50 bottom-full left-0 mb-2 w-72 bg-slate-800 text-white text-xs p-4 rounded-xl shadow-2xl pointer-events-none animate-fade-in">
                                      <div className="absolute bottom-[-6px] left-8 w-3 h-3 bg-slate-800 transform rotate-45"></div>
                                      {activeLimits[ing.id] === 'LOADING' ? (
                                         <div className="flex items-center gap-2 text-brand-300"><i className="fa-solid fa-circle-notch fa-spin"></i> <span>Consultando ANVISA...</span></div>
                                      ) : (
                                         <>
                                            <div className="font-bold border-b border-slate-600 pb-2 mb-2 text-brand-300 flex justify-between items-center">
                                              <span>Limites ({input.populationGroup})</span>
                                              {/* @ts-ignore */}
                                              <span className="text-[9px] font-bold bg-slate-700 px-2 py-0.5 rounded text-white/80 uppercase tracking-wider">{activeLimits[ing.id].unit}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                  <span className="block text-slate-400 text-[9px] uppercase tracking-wide">Mínimo</span>
                                                  {/* @ts-ignore */} 
                                                  <span className="font-bold text-emerald-400 text-sm">{activeLimits[ing.id].min}</span>
                                               </div>
                                               <div>
                                                  <span className="block text-slate-400 text-[9px] uppercase tracking-wide">Máximo</span>
                                                  {/* @ts-ignore */} 
                                                  <span className="font-bold text-red-400 text-sm">{activeLimits[ing.id].max}</span>
                                               </div>
                                            </div>
                                         </>
                                      )}
                                   </div>
                                )}
                             </div>
                             
                             {input.mode === 'EXISTING' ? (
                                <div className="flex gap-2 w-full sm:w-auto items-center">
                                    <input 
                                       type="number" 
                                       value={ing.amount} 
                                       onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)} 
                                       className="w-24 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                       placeholder="Qtd" 
                                    />
                                    <select 
                                       value={ing.unit} 
                                       onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value as MassUnit)} 
                                       className="w-20 p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="mg">mg</option>
                                        <option value="mcg">mcg</option>
                                        <option value="g">g</option>
                                    </select>
                                </div>
                             ) : (
                                <div className="w-40 px-4 py-2 text-xs text-center text-brand-600 font-medium bg-brand-50 rounded-lg border border-brand-100 flex items-center justify-center gap-2">
                                   <i className="fa-solid fa-wand-magic-sparkles"></i> Auto-Dose (IA)
                                </div>
                             )}
                             <button onClick={() => removeIngredient(ing.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all ml-auto sm:ml-0"><i className="fa-solid fa-trash-can"></i></button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* SEÇÃO 4: FORMA FARMACÊUTICA */}
              <div className="bg-brand-50/50 p-8 rounded-3xl border border-brand-100 mt-6">
                 <h3 className="text-base font-bold text-brand-900 uppercase mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-600 text-sm shadow-sm"><i className="fa-solid fa-capsules"></i></span>
                    Farmacotécnica
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Apresentação</label>
                       <select value={input.pharmaForm} onChange={(e) => updateInput('pharmaForm', e.target.value)} className="w-full p-3 border border-brand-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                          <option value="CAPSULA">Cápsula</option>
                          <option value="COMPRIMIDO">Comprimido</option>
                          <option value="PO">Pó (Pote/Sachê)</option>
                          <option value="LIQUIDO">Líquido / Xarope</option>
                          <option value="GOMAS">Gomas</option>
                       </select>
                    </div>
                    {input.pharmaForm === 'CAPSULA' && (
                       <>
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Tamanho</label>
                             <select value={input.capsuleSize} onChange={(e) => updateInput('capsuleSize', e.target.value)} className="w-full p-3 border border-brand-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                                {CAPSULE_SIZES.map(c => <option key={c.size} value={c.size}>Nº {c.size} ({c.capacityMg})</option>)}
                             </select>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Cor</label>
                             <input type="text" value={input.capsuleColor} onChange={(e) => updateInput('capsuleColor', e.target.value)} className="w-full p-3 border border-brand-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Branca" />
                          </div>
                       </>
                    )}
                 </div>
              </div>

              {/* SEÇÃO 5: DADOS DE CÁLCULO (SÓ SCRATCH) */}
              {input.mode === 'SCRATCH' && (
                 <div className="grid grid-cols-2 gap-8 bg-purple-50 p-6 rounded-3xl border border-purple-100">
                    <div>
                       <label className="block text-xs font-bold text-purple-700 mb-2 ml-1">Duração (dias)</label>
                       <input type="number" value={input.treatmentDuration} onChange={(e) => updateInput('treatmentDuration', e.target.value)} className="w-full p-3 border border-purple-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-purple-700 mb-2 ml-1">Doses/Dia</label>
                       <input type="number" value={input.targetDosesPerDay} onChange={(e) => updateInput('targetDosesPerDay', e.target.value)} className="w-full p-3 border border-purple-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                 </div>
              )}
              
              {/* SEÇÃO 6: ROTULAGEM */}
              <div className="grid grid-cols-1 gap-6 pt-2">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Porção no Rótulo (Visual)</label>
                    <input type="text" value={input.servingSize} onChange={(e) => updateInput('servingSize', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: 2 cápsulas (1,5g)" />
                 </div>
              </div>

              <button 
                 onClick={handleSubmit} 
                 disabled={loading} 
                 className={`w-full py-4 rounded-2xl font-display font-bold text-white text-lg shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-3 
                    ${loading 
                       ? 'bg-slate-400 cursor-wait' 
                       : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:to-brand-600 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0'}
                 `}
              >
                 {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                 {loading ? "Processando Engenharia..." : (input.mode === 'SCRATCH' ? "Calcular Fórmula Completa" : "Validar Fórmula")}
              </button>

           </div>
        </div>

        {error && (
           <div className="mt-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center shadow-sm animate-fade-in flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-xmark text-xl"></i> {error}
           </div>
        )}
      </div>
    );
  }

  // 3. REPORT VIEW (Sem alterações visuais no conteúdo do relatório em si para manter compatibilidade de impressão)
  if (step === 'REPORT' && report) {
    return (
       <div className="max-w-5xl mx-auto animate-fade-in pb-12">
          <div className="flex justify-between items-center mb-6 no-print">
              <button onClick={() => setStep('FORM')} className="text-slate-500 hover:text-brand-600 text-sm font-bold flex items-center gap-2 transition-colors"><i className="fa-solid fa-arrow-left"></i> Voltar</button>
              <button onClick={handleDownloadPdf} disabled={isDownloading} className={`bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}>
                {isDownloading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>} Baixar PDF Técnico
              </button>
          </div>

          <div id="formulation-report-content" className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-100">
             <div className="bg-slate-900 text-white p-8 border-b-4 border-brand-500">
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="text-xs font-bold text-brand-400 tracking-widest uppercase mb-1">RELATÓRIO TÉCNICO</h2>
                      <h1 className="text-3xl font-bold mb-1">{input.productName}</h1>
                      <p className="text-sm text-slate-300">Modo: {input.mode === 'SCRATCH' ? "Desenvolvimento" : "Validação"}</p>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-bold">FORMULADO 3.0</div>
                      <div className="text-xs text-slate-400">Análise via RDC 429/2020 & IN 75/2020</div>
                      <div className="text-xs text-slate-500 mt-1">{report.reportDate}</div>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-12 space-y-10">
                {report.mandatoryWarnings && report.mandatoryWarnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                    <h3 className="text-base font-bold text-amber-800 flex items-center gap-2 mb-3"><i className="fa-solid fa-triangle-exclamation"></i> Advertências Obrigatórias (Anexo VI)</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {report.mandatoryWarnings.map((warning, idx) => (<li key={idx} className="text-sm text-amber-900 font-bold bg-amber-100/50 p-2 rounded">"{warning}"</li>))}
                    </ul>
                  </div>
                )}

                {report.suggestedFormula && (
                   <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="text-lg font-bold text-purple-900 border-b border-purple-200 pb-2 mb-4 flex items-center gap-2"><i className="fa-solid fa-flask text-purple-600"></i> Sugestão de Fórmula (P&D)</h3>
                      <div className="mb-4"><p className="text-sm font-bold text-purple-800">Objetivo: {input.purpose}</p><p className="text-sm text-purple-700 mt-1">{report.suggestedFormula.capsuleFitAnalysis}</p></div>
                      <div className="bg-white rounded-lg border border-purple-100 overflow-hidden mb-4">
                         <table className="w-full text-sm text-left">
                            <thead className="bg-purple-100 text-purple-900 text-xs uppercase"><tr><th className="px-4 py-2">Ingrediente</th><th className="px-4 py-2">Dose Sugerida</th><th className="px-4 py-2">Racional</th></tr></thead>
                            <tbody className="divide-y divide-purple-50">
                               {report.suggestedFormula.ingredients?.map((item, idx) => (
                                  <tr key={idx}><td className="px-4 py-2 font-bold text-purple-900">{item.name}</td><td className="px-4 py-2 text-purple-800">{item.amountPerDose}</td><td className="px-4 py-2 text-xs text-purple-600 italic">{item.reason}</td></tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2"><i className="fa-solid fa-table text-brand-600"></i> Tabela Nutricional (Padrão ANVISA)</h3>
                      <div className="border border-black bg-white text-black font-sans antialiased min-w-[300px] inline-block p-0.5">
                         <div className="border border-black p-2">
                            <h4 className="font-bold text-[13px] text-center leading-tight mb-1">INFORMAÇÃO NUTRICIONAL</h4>
                            <p className="text-[11px] text-center leading-tight mb-2 font-medium">{report.nutritionalTable?.servingInfo}</p>
                            <div className="border-t border-black my-1"></div>
                            <div className="flex justify-between text-[11px] font-bold mb-1"><span></span><div className="flex gap-4"><span className="w-10 text-center">100g</span><span className="w-12 text-center">Porção</span><span className="w-8 text-right">%VD*</span></div></div>
                            <div className="border-t border-black mb-1"></div>
                            <div className="space-y-0">
                               {report.nutritionalTable?.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-[11px] border-b border-black last:border-0 py-0.5 items-center">
                                     <span className={`${item.nutrient === 'Valor Energético' ? 'font-bold' : ''} ${getIndentationClass(item.nutrient)}`}>{item.nutrient}</span>
                                     <div className="flex gap-4"><span className="w-10 text-center">{item.amountPer100}</span><span className="w-12 text-center">{item.amountPerServing}</span><span className="w-8 text-right font-bold">{item.vd}</span></div>
                                  </div>
                               ))}
                            </div>
                            <div className="border-t border-black mt-1"></div>
                            <p className="text-[8px] mt-1 leading-tight">{report.nutritionalTable?.footer}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div>
                         <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Texto de Rotulagem</h3>
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-800 font-medium leading-relaxed uppercase">
                            <p className="mb-4"><span className="font-bold text-slate-900">INGREDIENTES:</span> {report.formattedIngredientsList}</p>
                            <p className="font-bold text-slate-900 mb-2">{report.allergensDeclaration}</p>
                            <p className="font-bold text-slate-900">{report.glutenDeclaration}</p>
                         </div>
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-brand-900 uppercase mb-2">Alegações Permitidas</h4>
                         <ul className="space-y-2">
                            {report.claimsAnalysis?.map((claim, idx) => (
                               <li key={idx} className="bg-brand-50 text-brand-800 px-3 py-2 rounded text-xs border border-brand-100 flex gap-2"><i className="fa-solid fa-circle-info mt-0.5"></i> {claim}</li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
                <div className="text-center pt-8 border-t border-slate-200"><p className="text-xs text-slate-400">Documento gerado pelo FORMULADO 3.0. Validação final necessária por RT.</p></div>
             </div>
          </div>
       </div>
    );
  }

  return null;
};

export default FormulationAssistant;