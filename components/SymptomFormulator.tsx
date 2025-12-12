
import React, { useState } from 'react';
import { generateSymptomBasedFormula } from '../services/geminiService';
import { SymptomBasedReport, SymptomFormulationInput } from '../types';

// Lista extraída da matriz JSON fornecida
const SYMPTOMS_LIST = [
  "ACNE", "ACORDA COM SONO", "ALERGIAS", "ALERGIAS ALIMENT", "ALERGIAS TEMPOR.", "ALTER. PRESSÃO", "ALTERAÇÕES PELE", "ALTERAÇÕES VISÃO", 
  "ALTERN. HUMOR", "ALTERN. INTESTINAL", "ANEMIA", "ANSIEDADE", "APATIA", "APETITE IRREGULAR", "ARRITMIAS", "ARTRITE REUMAT", "BAIXA LIBIDO", 
  "BOCA SECA", "BRUXISMO", "BURNOUT", "CAIBRAS NOTURNAS", "CANSAÇO OCULAR", "CASPA", "CELÍACO", "COLICAS INTESTIN.", "CONF MENTAL", 
  "CÃIBRAS", "CÓLICA MENS. INTENSA", "DEMORA DORMIR", "DEPRESSAO POR PARTO", "DEPRESSÃO", "DEPRESSÃO SAZONAL", "DERMATITE", "DESCONF ABDOMINAL", 
  "DESMINERALIZAÇÃO OSSEA", "DESPERTA A NOITE", "DIABETES TIPO 2", "DIARREIA", "DIFIC GANHO MASSA", "DISTRESS/EUSTRESS", "DISTURBIO BIPOLAR", 
  "DOENÇA DE CROHN", "DOR ARTICULAR", "DOR CABEÇA FREQ.", "DOR GARGANTA RECOR", "DORES ARTICULARES", "DORES MUSCULARES", "DORES NA COLUNA", 
  "EDEMAS PERNAS", "ENDOMETRIOSE", "ENURESE", "ENXAQUECA", "EPISODIOS MEMORIA", "ESCLEROSE MULTIPLA", "ESQUIZOFRENIA", "ESTERILIDADE", 
  "ESTRESSE EXARCEBADO", "FADIGA CRONICA", "FLATULENCIAS", "FORMIGAMENTO", "FRATURAS FREQUENTES", "FRIO NAS EXTREMID", "GENGIVITE", 
  "HEMATOMAS FÁCEIS", "HEMORRAGIAS GENGIVAIS", "HERPES", "HIPERPIGMENTAÇÃO", "HIPERTENSÃO", "HIPOGLICEMIA", "HIPOGLICEMIA REATIVA", 
  "HIPOTIREOIDISMO", "IMPOTENCIA", "IMUNIDADE BAIXA", "INFEC URINAR. RECOR.", "INFECÇÕES REPETIÇÃO", "INFECÇÕES VIAS AÉREAS", "INFERTILIDADE FEM", 
  "INFERTILIDADE MASC", "INTES. IRRITAVEL", "IRRITABILIDADE", "MENOPAUSA", "MÁ CONCENTRAÇÃO", "MÁ DIGESTÃO", "MÁ MEMÓRIA", "NAUSEAS", 
  "NEUROPATIA PERIFERICA", "OLHOS SECOS", "OSTEOMALACIA", "OSTEOPOROSE", "OVARIO POLICISTICO", "PARKINSON", "PELE AMARELADA", "PELE SECA", 
  "PERDA DE APETITE", "PERDA DE MASSA OSSEA", "PERNAS CANSADAS", "PERNAS INQUIETAS", "PESSIMISMO/DEPRESSÃO", "PIELONEFRITE", "PROBL CICATRIZAÇÃO", 
  "PROBLEM. CRESCIMENTO", "PSORIASE", "QUEDA DE CABELO", "RACHAD. LABIOS", "RACHADURAS CANTO BOCA", "ROSACEA", "SEM ENERGIA", "SENSIBILIDADE CALOR", 
  "SENSIBILIDADE FRIO", "SIND. FADIGA CRONICA", "SIND. INTEST. PERMEAVEL", "SINDROME METABO.", "SINUSITE CRONICA", "SONO IRREGULAR", 
  "SONOLENCIA NO DIA", "SUDORESE EXCESSIVA", "TENDINITE", "TONTURA AO LEVANTAR", "TONTURA/VERTIGEM", "UNHAS FRACAS", "VISÃO NOTURNA RUIM"
].sort();

interface SymptomFormulatorProps {
  onBack: () => void;
}

const SymptomFormulator: React.FC<SymptomFormulatorProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  // Patient Data State
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState<'masculino' | 'feminino' | 'outro'>('feminino');
  const [patientWeight, setPatientWeight] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [comorbidities, setComorbidities] = useState("");
  const [dietRestrictions, setDietRestrictions] = useState("");
  const [patientNotes, setPatientNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SymptomBasedReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const filteredSymptoms = SYMPTOMS_LIST.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Selecione pelo menos um sintoma.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setReport(null);

    const input: SymptomFormulationInput = {
      selectedSymptoms,
      patientData: {
        age: patientAge,
        sex: patientSex,
        weightKg: patientWeight,
        isPregnantOrLactating: isPregnant,
        comorbidities: comorbidities.split(',').map(s => s.trim()).filter(s => s),
        dietaryRestrictions: dietRestrictions.split(',').map(s => s.trim()).filter(s => s)
      },
      goals: [],
      notes: patientNotes
    };

    try {
      const result = await generateSymptomBasedFormula(input);
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar a fórmula.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const element = document.getElementById('symptom-report-content');
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Formula_Sintomas_${new Date().getTime()}.pdf`,
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

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* Header com Botão Voltar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2">
           <i className="fa-solid fa-arrow-left"></i> Voltar ao Menu
        </button>
        <div className="text-right">
           <h1 className="text-2xl font-extrabold text-slate-900">Formulador Clínico</h1>
           <p className="text-xs text-slate-500">Baseado em Matriz de Sintomas</p>
        </div>
      </div>

      {!report ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* COLUNA 1: DADOS DO PACIENTE */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase">
                  <i className="fa-solid fa-user-circle text-indigo-600"></i> Perfil Paciente
                </h3>
                
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Idade</label>
                      <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="Anos" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Sexo</label>
                      <select value={patientSex} onChange={e => setPatientSex(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded text-sm">
                         <option value="feminino">Feminino</option>
                         <option value="masculino">Masculino</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Peso (kg)</label>
                      <input type="number" value={patientWeight} onChange={e => setPatientWeight(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="kg" />
                   </div>
                   
                   {patientSex === 'feminino' && (
                      <div className="flex items-center gap-2 mt-2 bg-pink-50 p-2 rounded border border-pink-100">
                         <input type="checkbox" checked={isPregnant} onChange={e => setIsPregnant(e.target.checked)} className="rounded text-pink-500" />
                         <span className="text-xs text-pink-700 font-bold">Gestante / Lactante</span>
                      </div>
                   )}

                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Comorbidades</label>
                      <input type="text" value={comorbidities} onChange={e => setComorbidities(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="Ex: Diabetes, Hipertensão" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Restrições Alimentares</label>
                      <input type="text" value={dietRestrictions} onChange={e => setDietRestrictions(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="Ex: Vegano, Sem Lactose" />
                   </div>
                </div>
             </div>
          </div>

          {/* COLUNA 2: SELEÇÃO DE SINTOMAS */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <i className="fa-solid fa-list-check text-indigo-600"></i> Sintomas Clínicos
               </h3>
               <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-bold">
                 {selectedSymptoms.length}
               </span>
            </div>

            <div className="relative mb-4">
              <i className="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
              <input
                type="text"
                placeholder="Buscar sintoma..."
                className="w-full pl-10 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-2 min-h-[400px]">
              {filteredSymptoms.map(symptom => (
                <label 
                  key={symptom} 
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs font-medium select-none h-fit
                    ${selectedSymptoms.includes(symptom) 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}
                  `}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="accent-indigo-600 rounded w-4 h-4 flex-shrink-0"
                  />
                  <span className="leading-tight">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* COLUNA 3: RESUMO E AÇÃO */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase">
                 <i className="fa-solid fa-clipboard-list text-indigo-600"></i> Resumo
               </h3>
               
               <div className="flex flex-wrap gap-1 mb-6 max-h-60 overflow-y-auto content-start">
                  {selectedSymptoms.length === 0 && <span className="text-sm text-slate-400 italic">Selecione sintomas para começar.</span>}
                  {selectedSymptoms.map(s => (
                    <span key={s} className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-1 rounded flex items-center gap-1 border border-indigo-200">
                      {s} <i className="fa-solid fa-times cursor-pointer hover:text-indigo-950" onClick={() => toggleSymptom(s)}></i>
                    </span>
                  ))}
               </div>

               <textarea
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs h-24 resize-none outline-none focus:border-indigo-500"
                  placeholder="Notas extras para a IA..."
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
               />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || selectedSymptoms.length === 0}
              className={`
                w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                ${loading || selectedSymptoms.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-xl transform hover:scale-[1.02]'}
              `}
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> Calculando...</>
              ) : (
                <><i className="fa-solid fa-flask"></i> Gerar Fórmula</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
           <div className="flex justify-between items-center mb-6 no-print">
              <button onClick={() => setReport(null)} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
                 <i className="fa-solid fa-arrow-left mr-1"></i> Voltar para Seleção
              </button>
              <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isDownloading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                Baixar Receita
              </button>
           </div>

           <div id="symptom-report-content" className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-100">
              {/* Header */}
              <div className="bg-indigo-900 text-white p-8 border-b-4 border-indigo-500">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-xs font-bold text-indigo-300 tracking-widest uppercase mb-1">SUGESTÃO DE FÓRMULA</h2>
                       <h1 className="text-3xl font-bold mb-1">Protocolo Personalizado</h1>
                       <div className="text-xs text-indigo-200 mt-2 flex flex-wrap gap-4">
                          <span><strong>Paciente:</strong> {patientSex}, {patientAge} anos, {patientWeight}kg</span>
                          {isPregnant && <span className="bg-pink-500 px-2 rounded text-white font-bold">Gestante</span>}
                       </div>
                    </div>
                    <div className="text-right hidden md:block">
                       <div className="text-2xl font-bold"><i className="fa-solid fa-user-doctor"></i></div>
                       <div className="text-xs text-indigo-300 mt-1">Sintomas: {report.relatorio_justificativas.texto_resumido.substring(0, 50)}...</div>
                    </div>
                 </div>
              </div>

              <div className="p-8 md:p-12 space-y-10">
                 
                 {/* Ingredients Table */}
                 <div>
                    <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-4">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <i className="fa-solid fa-capsules text-indigo-600"></i> Composição da Fórmula
                       </h3>
                       <div className="text-right text-xs text-slate-500">
                          <p><strong>Forma:</strong> {report.formula_final.forma_farmaceutica.tipo} ({report.formula_final.forma_farmaceutica.material_capsula})</p>
                          <p><strong>Posologia:</strong> {report.formula_final.forma_farmaceutica.esquema_tomada}</p>
                       </div>
                    </div>

                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-indigo-50 text-indigo-900 text-xs uppercase">
                             <tr>
                                <th className="px-4 py-3 rounded-l-lg">Ativo</th>
                                <th className="px-4 py-3">Dose</th>
                                <th className="px-4 py-3">Justificativa & Sintomas</th>
                                <th className="px-4 py-3 rounded-r-lg">Horário</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {report.formula_final.nutrientes_selecionados.map((ing, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                   <td className="px-4 py-3 font-bold text-slate-800">
                                      {ing.nome}
                                      <span className="block text-xs text-slate-400 font-normal">{ing.id_nutriente}</span>
                                   </td>
                                   <td className="px-4 py-3">
                                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                         {ing.dose_diaria_sugerida.valor} {ing.dose_diaria_sugerida.unidade}
                                      </span>
                                      {ing.faixa_referencia.ajuste_legislacao_aplicado && (
                                         <span className="block text-[9px] text-red-500 mt-1">*Ajustado p/ Legislação</span>
                                      )}
                                   </td>
                                   <td className="px-4 py-3 text-xs text-slate-600 leading-relaxed max-w-md">
                                      {ing.observacoes_para_formula}
                                      <div className="mt-1 flex flex-wrap gap-1">
                                         {ing.sintomas_que_justificam.map((s, i) => (
                                            <span key={i} className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                                         ))}
                                      </div>
                                   </td>
                                   <td className="px-4 py-3 text-xs font-medium text-slate-500">
                                      {ing.horario_recomendado}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    
                    {/* Excipientes */}
                    <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-500">
                       <strong>Excipientes Sugeridos:</strong> {report.formula_final.excipientes_sugeridos.join(', ')}.
                    </div>
                 </div>

                 {/* Resumo Clínico */}
                 <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 uppercase mb-2">Racional Clínico</h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                       {report.relatorio_justificativas.texto_tecnico}
                    </p>
                 </div>

                 {/* Warnings */}
                 {(report.alertas_e_cuidados.alertas_sobre_dose.length > 0 || report.alertas_e_cuidados.alertas_sobre_interacoes.length > 0) && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                       <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                          <i className="fa-solid fa-triangle-exclamation"></i> Pontos de Atenção
                       </h4>
                       <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                          {report.alertas_e_cuidados.alertas_sobre_dose.map((w, i) => <li key={`dose-${i}`}>{w}</li>)}
                          {report.alertas_e_cuidados.alertas_sobre_interacoes.map((w, i) => <li key={`int-${i}`}>{w}</li>)}
                          {report.alertas_e_cuidados.alertas_sobre_perfil_paciente.map((w, i) => <li key={`pat-${i}`}>{w}</li>)}
                       </ul>
                    </div>
                 )}

                 <div className="text-center pt-8 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 leading-tight">
                       Isenção de responsabilidade: Esta sugestão é gerada por IA baseada em algoritmos nutricionais. A validação final e prescrição é de responsabilidade exclusiva do profissional de saúde habilitado.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center shadow-sm animate-fade-in">
           <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}
    </div>
  );
};

export default SymptomFormulator;
