import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { generateNutritionalTable, auditNutritionalTable } from '../services/geminiService';
import { NutriTableGeneratorInput, NutriTableItemInput, GeneratedTableOutput, TableAuditResult, PopulationGroup } from '../types';

const NUTRIENT_PRESETS = [
  { name: "Valor Energético", unit: "kcal", isBold: true },
  { name: "Carboidratos", unit: "g", isBold: true },
  { name: "Açúcares Totais", unit: "g", indentation: 1 },
  { name: "Açúcares Adicionados", unit: "g", indentation: 1 },
  { name: "Proteínas", unit: "g", isBold: true },
  { name: "Gorduras Totais", unit: "g", isBold: true },
  { name: "Gorduras Saturadas", unit: "g", indentation: 1 },
  { name: "Gorduras Trans", unit: "g", indentation: 1 },
  { name: "Fibra Alimentar", unit: "g", isBold: true },
  { name: "Sódio", unit: "mg", isBold: true },
];

const AVAILABLE_NUTRIENTS = [
  // MACROS DETALHADOS
  { category: "MACROS & GORDURAS", name: "Gorduras Monoinsaturadas", unit: "g", indentation: 1 },
  { category: "MACROS & GORDURAS", name: "Gorduras Poli-insaturadas", unit: "g", indentation: 1 },
  { category: "MACROS & GORDURAS", name: "Ômega 3", unit: "mg", indentation: 2 },
  { category: "MACROS & GORDURAS", name: "EPA", unit: "mg", indentation: 2 },
  { category: "MACROS & GORDURAS", name: "DHA", unit: "mg", indentation: 2 },
  { category: "MACROS & GORDURAS", name: "Colesterol", unit: "mg", indentation: 1 },
  { category: "MACROS & GORDURAS", name: "Polióis", unit: "g", indentation: 1 },
  { category: "MACROS & GORDURAS", name: "Amido", unit: "g", indentation: 1 },
  { category: "MACROS & GORDURAS", name: "Lactose", unit: "g", indentation: 1 },

  // VITAMINAS
  { category: "VITAMINAS", name: "Vitamina A", unit: "mcg" },
  { category: "VITAMINAS", name: "Vitamina D", unit: "mcg" },
  { category: "VITAMINAS", name: "Vitamina C", unit: "mg" },
  { category: "VITAMINAS", name: "Vitamina E", unit: "mg" },
  { category: "VITAMINAS", name: "Tiamina (Vit. B1)", unit: "mg" },
  { category: "VITAMINAS", name: "Riboflavina (Vit. B2)", unit: "mg" },
  { category: "VITAMINAS", name: "Niacina (Vit. B3)", unit: "mg" },
  { category: "VITAMINAS", name: "Ácido Pantotênico (Vit. B5)", unit: "mg" },
  { category: "VITAMINAS", name: "Vitamina B6", unit: "mg" },
  { category: "VITAMINAS", name: "Biotina (Vit. B7)", unit: "mcg" },
  { category: "VITAMINAS", name: "Ácido Fólico (Vit. B9)", unit: "mcg" },
  { category: "VITAMINAS", name: "Vitamina B12", unit: "mcg" },
  { category: "VITAMINAS", name: "Vitamina K", unit: "mcg" },

  // MINERAIS
  { category: "MINERAIS", name: "Cálcio", unit: "mg" },
  { category: "MINERAIS", name: "Ferro", unit: "mg" },
  { category: "MINERAIS", name: "Magnésio", unit: "mg" },
  { category: "MINERAIS", name: "Zinco", unit: "mg" },
  { category: "MINERAIS", name: "Iodo", unit: "mcg" },
  { category: "MINERAIS", name: "Fósforo", unit: "mg" },
  { category: "MINERAIS", name: "Cobre", unit: "mcg" },
  { category: "MINERAIS", name: "Selênio", unit: "mcg" },
  { category: "MINERAIS", name: "Molibdênio", unit: "mcg" },
  { category: "MINERAIS", name: "Cromo", unit: "mcg" },
  { category: "MINERAIS", name: "Manganês", unit: "mg" },
  { category: "MINERAIS", name: "Potássio", unit: "mg" },

  // OUTROS
  { category: "BIOATIVOS & OUTROS", name: "Colina", unit: "mg" },
  { category: "BIOATIVOS & OUTROS", name: "Cafeína", unit: "mg" },
  { category: "BIOATIVOS & OUTROS", name: "Taurina", unit: "mg" },
  { category: "BIOATIVOS & OUTROS", name: "Colágeno", unit: "g" },
  { category: "BIOATIVOS & OUTROS", name: "Triptofano", unit: "mg" },
];

const NutritionalTableTool: React.FC = () => {
  const [mode, setMode] = useState<'GENERATOR' | 'AUDITOR'>('GENERATOR');
  
  // --- STATES FOR GENERATOR ---
  const [genInput, setGenInput] = useState<NutriTableGeneratorInput>({
    servingSize: "20g",
    servingDesc: "1 colher de sopa",
    servingsPerContainer: "30",
    layout: 'VERTICAL',
    populationGroup: 'ADULTOS',
    items: NUTRIENT_PRESETS.map(p => ({ 
      nutrientName: p.name, 
      value: 0, 
      unit: p.unit as any, 
      isBold: p.isBold, 
      indentation: p.indentation 
    }))
  });
  const [generatedTable, setGeneratedTable] = useState<GeneratedTableOutput | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // --- STATES FOR AUDITOR ---
  const [auditFile, setAuditFile] = useState<File | null>(null);
  const [auditResult, setAuditResult] = useState<TableAuditResult | null>(null);
  const [auditPreview, setAuditPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS GENERATOR ---
  const handleItemChange = (index: number, field: keyof NutriTableItemInput, value: any) => {
    const newItems = [...genInput.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setGenInput({ ...genInput, items: newItems });
  };

  const addCustomItem = () => {
    setGenInput({
      ...genInput,
      items: [...genInput.items, { nutrientName: "Novo Nutriente", value: 0, unit: "mg" }]
    });
  };

  const addPresetItem = () => {
    if (!selectedPreset) return;
    const preset = AVAILABLE_NUTRIENTS.find(n => n.name === selectedPreset);
    if (preset) {
       setGenInput({
         ...genInput,
         items: [...genInput.items, { 
            nutrientName: preset.name, 
            value: 0, 
            unit: preset.unit as any,
            indentation: preset.indentation || 0
         }]
       });
       setSelectedPreset(""); // Resetar seleção
    }
  };

  // Permite remover QUALQUER item da lista (mesmo os iniciais)
  const removeItem = (index: number) => {
    const newItems = genInput.items.filter((_, i) => i !== index);
    setGenInput({ ...genInput, items: newItems });
  };
  
  // Restaura os campos padrão se o usuário apagou tudo por engano
  const restoreDefaults = () => {
    if (window.confirm("Deseja restaurar os itens obrigatórios padrão? Isso apagará os dados atuais.")) {
       setGenInput(prev => ({
         ...prev,
         items: NUTRIENT_PRESETS.map(p => ({ 
            nutrientName: p.name, 
            value: 0, 
            unit: p.unit as any, 
            isBold: p.isBold, 
            indentation: p.indentation 
          }))
       }));
    }
  };

  // Limpa toda a lista (para quem quer começar do zero)
  const clearAllItems = () => {
    if (window.confirm("Tem certeza que deseja limpar toda a tabela?")) {
      setGenInput({ ...genInput, items: [] });
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedTable(null);
    try {
      const result = await generateNutritionalTable(genInput);
      setGeneratedTable(result);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar tabela.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS AUDITOR ---
  const handleAudit = async (file: File) => {
    setAuditFile(file);
    setAuditPreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);
    setAuditResult(null);
    try {
      const result = await auditNutritionalTable(file);
      setAuditResult(result);
    } catch (err: any) {
      setError(err.message || "Erro na auditoria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-extrabold text-slate-900 mb-2">NutriTable Expert</h1>
        <p className="text-slate-600">Módulo especializado em cálculos e auditoria de tabelas conforme RDC 429 e IN 75.</p>
      </div>

      {/* TABS */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
          <button
            onClick={() => setMode('GENERATOR')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'GENERATOR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
          >
            <i className="fa-solid fa-calculator mr-2"></i> Gerador (Cálculo)
          </button>
          <button
            onClick={() => setMode('AUDITOR')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'AUDITOR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-500'}`}
          >
            <i className="fa-solid fa-magnifying-glass-chart mr-2"></i> Auditor (Conferência)
          </button>
        </div>
      </div>

      {mode === 'GENERATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INPUT FORM */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             
             {/* CONFIGURAÇÕES GERAIS DA TABELA */}
             <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                   <i className="fa-solid fa-sliders text-indigo-500"></i> Configurações da Tabela
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Público Alvo (VDR) */}
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Público Alvo (VDR)</label>
                      <select 
                         value={genInput.populationGroup}
                         onChange={(e) => setGenInput({...genInput, populationGroup: e.target.value as PopulationGroup})}
                         className="w-full p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                         <option value="ADULTOS">Adultos (≥ 19 anos)</option>
                         <option value="LACTENTES_0_6">Lactentes (0-6 meses)</option>
                         <option value="CRIANCAS_7_11">Crianças (7-11 meses)</option>
                         <option value="CRIANCAS_1_3">Crianças (1-3 anos)</option>
                         <option value="CRIANCAS_4_8">Crianças (4-8 anos)</option>
                         <option value="CRIANCAS_9_18">Crianças (9-18 anos)</option>
                         <option value="GESTANTES">Gestantes</option>
                         <option value="LACTANTES">Lactantes</option>
                      </select>
                   </div>
                   
                   {/* Modelo Visual (Layout) */}
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Modelo Visual</label>
                      <select 
                         value={genInput.layout}
                         onChange={(e) => setGenInput({...genInput, layout: e.target.value as 'VERTICAL' | 'LINEAR' | 'SIMPLIFIED'})}
                         className="w-full p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                         <option value="VERTICAL">Vertical (Padrão)</option>
                         <option value="LINEAR">Linear (Texto Corrido)</option>
                         <option value="SIMPLIFIED">Simplificada (Vits/Min)</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Porção (g/ml)</label>
                       <input 
                          type="text" 
                          value={genInput.servingSize} 
                          onChange={e => setGenInput({...genInput, servingSize: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                          placeholder="Ex: 20g"
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Medida Caseira</label>
                       <input 
                          type="text" 
                          value={genInput.servingDesc} 
                          onChange={e => setGenInput({...genInput, servingDesc: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                          placeholder="Ex: 1 scoop"
                       />
                    </div>
                 </div>
             </div>

             {/* LISTA DE ITENS */}
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  <i className="fa-solid fa-list-ol text-indigo-500 mr-2"></i> Linhas da Tabela
                </h3>
                <div className="flex gap-2">
                   {genInput.items.length > 0 && (
                      <button onClick={clearAllItems} className="text-[10px] text-red-500 hover:text-red-700 font-bold border border-red-200 px-2 py-0.5 rounded hover:bg-red-50">
                         Limpar Tudo
                      </button>
                   )}
                   {genInput.items.length < NUTRIENT_PRESETS.length && (
                      <button onClick={restoreDefaults} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-50">
                         Restaurar Padrão
                      </button>
                   )}
                </div>
             </div>

             <div className="space-y-3 mb-6">
                {genInput.items.length === 0 && (
                   <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Nenhum item na tabela. Adicione abaixo.
                   </div>
                )}
                {genInput.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                     <div className={`flex-1 ${item.indentation === 1 ? 'pl-4 border-l-2 border-slate-100' : item.indentation === 2 ? 'pl-8 border-l-2 border-slate-100' : ''}`}>
                        <input 
                          type="text" 
                          value={item.nutrientName} 
                          onChange={e => handleItemChange(idx, 'nutrientName', e.target.value)}
                          className={`w-full p-2 border-b border-slate-100 bg-transparent text-sm ${item.isBold ? 'font-bold' : ''} outline-none focus:border-indigo-300 placeholder-slate-300`}
                          placeholder="Nome do nutriente"
                        />
                     </div>
                     <input 
                        type="number" 
                        value={item.value} 
                        onChange={e => handleItemChange(idx, 'value', parseFloat(e.target.value))}
                        className="w-20 p-2 border border-slate-200 rounded text-sm text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                     <select 
                        value={item.unit} 
                        onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-16 p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                     >
                        <option value="g">g</option>
                        <option value="mg">mg</option>
                        <option value="mcg">mcg</option>
                        <option value="kcal">kcal</option>
                     </select>
                     {/* Botão de Exclusão Disponível para TODOS */}
                     <button 
                        onClick={() => removeItem(idx)} 
                        className="text-slate-300 hover:text-red-500 w-6"
                        title="Remover linha"
                     >
                        <i className="fa-solid fa-trash"></i>
                     </button>
                  </div>
                ))}
             </div>

             {/* ADDER SECTION */}
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adicionar Linha Extra</label>
                <div className="flex gap-2">
                   <select 
                      value={selectedPreset} 
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white outline-none"
                   >
                      <option value="">Selecione um nutriente...</option>
                      {Array.from(new Set(AVAILABLE_NUTRIENTS.map(n => n.category))).map(cat => (
                         <optgroup key={cat} label={cat}>
                            {AVAILABLE_NUTRIENTS.filter(n => n.category === cat).map(n => (
                               <option key={n.name} value={n.name}>{n.name} ({n.unit})</option>
                            ))}
                         </optgroup>
                      ))}
                   </select>
                   <button 
                      onClick={addPresetItem} 
                      disabled={!selectedPreset}
                      className={`px-4 py-2 rounded text-sm font-bold text-white transition-all ${!selectedPreset ? 'bg-slate-300' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                   >
                      <i className="fa-solid fa-plus"></i>
                   </button>
                   <button 
                      onClick={addCustomItem} 
                      className="px-4 py-2 rounded text-sm font-bold bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all"
                      title="Adicionar Manualmente"
                   >
                      <i className="fa-solid fa-pen"></i>
                   </button>
                </div>
             </div>

             <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
             >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-calculator"></i>}
                Gerar Tabela ({genInput.layout === 'VERTICAL' ? 'Padrão' : genInput.layout === 'LINEAR' ? 'Linear' : 'Simplificada'})
             </button>
          </div>

          {/* PREVIEW */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-start min-h-[400px]">
             {loading && <div className="text-indigo-600 animate-pulse font-bold mt-10">Calculando VDR ({genInput.populationGroup}) e Formatando...</div>}
             
             {!loading && !generatedTable && (
               <div className="text-center text-slate-400 mt-20">
                  <i className="fa-solid fa-table text-4xl mb-3 opacity-20"></i>
                  <p className="text-sm">Configure os dados ao lado e clique em Gerar.</p>
               </div>
             )}

             {generatedTable && (
                <div className="w-full animate-fade-in-up">
                   <div className="flex justify-center mb-4">
                      <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                         Preview: {genInput.layout} | Grupo: {genInput.populationGroup}
                      </span>
                   </div>

                   <div className="bg-white p-4 shadow-lg border border-slate-200 max-w-sm mx-auto transform scale-100 hover:scale-[1.01] transition-transform overflow-x-auto">
                      {/* RENDERIZAÇÃO SEGURA DO HTML GERADO PELA IA */}
                      <div dangerouslySetInnerHTML={{ __html: generatedTable.htmlPreview }} />
                   </div>

                   {generatedTable.warnings.length > 0 && (
                      <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                         <h4 className="text-xs font-bold text-amber-800 uppercase mb-2"><i className="fa-solid fa-triangle-exclamation"></i> Notas de Cálculo</h4>
                         <ul className="list-disc list-inside text-xs text-amber-700 space-y-1">
                            {generatedTable.warnings.map((w, i) => <li key={i}>{w}</li>)}
                         </ul>
                      </div>
                   )}
                </div>
             )}
          </div>
        </div>
      )}

      {mode === 'AUDITOR' && (
        <div className="max-w-4xl mx-auto">
           {!auditResult ? (
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center">
                 <ImageUpload 
                    onImageSelected={handleAudit} 
                    title="Arraste a imagem da tabela para conferência"
                    icon="fa-file-shield"
                    showNotes={false}
                 />
                 {loading && <div className="mt-4 text-emerald-600 font-bold animate-pulse">Auditando valores matemáticos...</div>}
                 {error && <div className="mt-4 text-red-500 text-sm font-bold bg-red-50 p-2 rounded">{error}</div>}
              </div>
           ) : (
              <div className="animate-fade-in-up">
                 <button onClick={() => setAuditResult(null)} className="mb-4 text-slate-500 hover:text-emerald-600 text-sm font-bold flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Nova Auditoria
                 </button>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Imagem Original */}
                    <div className="md:col-span-1 bg-slate-100 p-2 rounded-xl border border-slate-200">
                       <img src={auditPreview || ''} alt="Audit" className="w-full rounded-lg" />
                       <div className="mt-2 text-center text-xs text-slate-500 font-mono">Porção Identificada: {auditResult.servingFound}</div>
                    </div>

                    {/* Relatório */}
                    <div className="md:col-span-2 space-y-6">
                       
                       {/* STATUS CARD */}
                       <div className={`p-6 rounded-xl border-l-8 shadow-sm flex justify-between items-center
                          ${auditResult.status === 'CONFORME' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-500 text-red-900'}
                       `}>
                          <div>
                             <h3 className="text-xl font-bold mb-1">Status: {auditResult.status}</h3>
                             <p className="text-sm opacity-80">{auditResult.generalConclusion}</p>
                          </div>
                          <div className="text-3xl">
                             {auditResult.status === 'CONFORME' ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle-xmark"></i>}
                          </div>
                       </div>

                       {/* DISCREPANCIES */}
                       {auditResult.discrepancies.length > 0 && (
                          <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
                             <div className="bg-red-50 p-3 border-b border-red-100 text-red-800 font-bold text-sm flex items-center gap-2">
                                <i className="fa-solid fa-bug"></i> Divergências Encontradas
                             </div>
                             <div className="divide-y divide-slate-100">
                                {auditResult.discrepancies.map((d, i) => (
                                   <div key={i} className="p-4 flex gap-4 items-start hover:bg-red-50/30 transition-colors">
                                      <div className="bg-red-100 text-red-700 font-bold text-xs px-2 py-1 rounded w-24 text-center shrink-0">
                                         {d.nutrient}
                                      </div>
                                      <div className="flex-1">
                                         <p className="text-sm font-bold text-slate-800">{d.issue}</p>
                                         <div className="flex gap-4 mt-1 text-xs text-slate-500 font-mono">
                                            <span>Declarado: VD {d.declaredVD}</span>
                                            <span className="text-emerald-600 font-bold">Calculado: VD {d.calculatedVD}</span>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}

                       {/* ENERGY CHECK */}
                       <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center text-sm">
                          <div className="text-blue-900">
                             <strong>Checagem Energética (Atwater):</strong><br/>
                             <span className="text-xs">Declarado: {auditResult.energyCheck.declaredKcal} kcal | Calculado: {auditResult.energyCheck.calculatedKcal} kcal</span>
                          </div>
                          <div className={`font-bold px-3 py-1 rounded text-xs ${Math.abs(auditResult.energyCheck.differencePercent) > 20 ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'}`}>
                             Dif: {auditResult.energyCheck.differencePercent}%
                          </div>
                       </div>

                    </div>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default NutritionalTableTool;