
import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { analyzeChemicalFormula } from '../services/geminiService';
import { ChemicalAnalysisReport } from '../types';

const FormulaAnalyzer: React.FC = () => {
  const [report, setReport] = useState<ChemicalAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<'image' | 'text'>('image');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Inputs
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [containerType, setContainerType] = useState("Pote Plástico (PET) Transparente");
  const [productNameInput, setProductNameInput] = useState("");

  const handleAnalyze = async () => {
    if (activeInput === 'image' && !file) {
      alert("Por favor, envie uma imagem da tabela nutricional ou lista de ingredientes.");
      return;
    }
    if (activeInput === 'text' && textInput.length < 10) {
      alert("Por favor, digite a lista de ingredientes.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await analyzeChemicalFormula(
        activeInput === 'image' ? file : null,
        activeInput === 'text' ? textInput : null,
        containerType,
        productNameInput
      );
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar análise química.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const element = document.getElementById('formula-report-content');
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Analise_Quimica_${report?.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'produto'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        windowWidth: 1024 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      if (window.html2pdf) {
        // @ts-ignore
        await window.html2pdf().set(options).from(element).save();
      } else {
        window.print();
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Usando impressão padrão.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const getContainerIcon = () => {
    if (containerType.toLowerCase().includes('vidro')) return 'fa-wine-bottle';
    if (containerType.toLowerCase().includes('sachê')) return 'fa-file';
    return 'fa-bottle-water';
  };

  const getDecayColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-emerald-500';
    if (percentage >= 85) return 'bg-lime-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Análise Química & Estabilidade
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Avaliação técnica de interações entre vitaminas, fotossensibilidade e compatibilidade com a embalagem (pote).
        </p>
      </div>

      {/* Input Section */}
      {!report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Coluna 1: Configuração da Embalagem */}
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <i className="fa-solid fa-box-open text-blue-600"></i> Parâmetros
             </h3>
             
             <label className="block text-sm text-slate-600 mb-2 font-medium">Nome do Produto</label>
             <input
               type="text"
               placeholder="Ex: Polivitamínico AZ"
               className="w-full p-3 mb-4 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
               value={productNameInput}
               onChange={(e) => setProductNameInput(e.target.value)}
             />

             <label className="block text-sm text-slate-600 mb-2 font-medium">Tipo de Pote</label>
             <select 
               className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
               value={containerType}
               onChange={(e) => setContainerType(e.target.value)}
             >
               <option>Pote Plástico (PET) Transparente</option>
               <option>Pote Plástico (PET) Âmbar/Escuro</option>
               <option>Pote Plástico (PEAD) Branco Opaco</option>
               <option>Pote de Vidro Transparente</option>
               <option>Pote de Vidro Âmbar</option>
               <option>Lata de Alumínio / Metal</option>
               <option>Sachê Aluminizado (Barreira Luz)</option>
               <option>Blister (PVC/Alu) - Transparente</option>
               <option>Blister (Alu/Alu) - Opaco</option>
             </select>
             <p className="text-xs text-slate-500 mt-3 leading-tight">
               *A escolha correta é crucial para analisar a fotodegradação de vitaminas sensíveis.
             </p>
          </div>

          {/* Coluna 2 e 3: Ingredientes */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <i className="fa-solid fa-flask text-purple-600"></i> Ingredientes
               </h3>
               <div className="flex bg-slate-100 rounded-lg p-1">
                 <button 
                   onClick={() => setActiveInput('image')}
                   className={`px-3 py-1 text-xs font-medium rounded ${activeInput === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                 >
                   Imagem
                 </button>
                 <button 
                   onClick={() => setActiveInput('text')}
                   className={`px-3 py-1 text-xs font-medium rounded ${activeInput === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                 >
                   Texto
                 </button>
               </div>
             </div>

             {activeInput === 'image' ? (
                <ImageUpload 
                  onImageSelected={(f) => setFile(f)} 
                  title="Foto da Lista de Ingredientes"
                  icon="fa-file-image"
                  showNotes={false}
                />
             ) : (
                <textarea
                  className="w-full h-48 p-4 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Cole aqui a lista de ingredientes (ex: Óxido de Magnésio, Vitamina C, Vitamina B12, Maltodextrina...)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
             )}

             <button
               onClick={handleAnalyze}
               disabled={loading}
               className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2
                 ${loading ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.01]'}
               `}
             >
               {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-microscope"></i>}
               {loading ? "Processando Química..." : "Analisar Estabilidade"}
             </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-12 text-center animate-pulse">
           <p className="text-slate-500 text-sm">Analisando interações moleculares e estabilidade...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}

      {/* Results Report */}
      {report && (
        <div className="mt-8 animate-fade-in-up space-y-8">
           
           <div className="flex justify-between items-center mb-6 no-print">
              <button onClick={() => setReport(null)} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
                 <i className="fa-solid fa-arrow-left mr-1"></i> Nova Análise
              </button>
              <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className={`bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
              >
                {isDownloading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                Baixar Laudo Químico
              </button>
           </div>

           {/* --- RELATÓRIO OFICIAL ID --- */}
           <div id="formula-report-content" className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-100">
             
             {/* CABEÇALHO DO RELATÓRIO */}
             <div className="bg-slate-900 text-white p-8 border-b-4 border-purple-500">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                   <div>
                      <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-1">RELATÓRIO DE ESTABILIDADE</h2>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{report.productName || "Produto Não Identificado"}</h1>
                      <div className="flex flex-col gap-1 text-slate-300 text-xs mt-3">
                         <p><strong>Data da Análise:</strong> {report.analysisDate}</p>
                         <p><strong>Parâmetros de Referência:</strong> {report.analysisParameters}</p>
                      </div>
                   </div>
                   <div className="text-right flex flex-col justify-end">
                      <div className="text-xs text-slate-400 font-bold mb-1">Setor de Planejamento e Análise de Produtos</div>
                      <div className="text-[10px] text-slate-500 uppercase">Documento Interno</div>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-12 space-y-8">

                 {/* 1. Compatibilidade da Embalagem (Destaque) */}
                 <div className={`p-6 rounded-xl border-l-8 shadow-sm flex flex-col md:flex-row gap-6 items-center
                    ${report.packagingCompatibility.suitability === 'ADEQUADO' ? 'bg-emerald-50 border-emerald-500' : 
                      report.packagingCompatibility.suitability === 'INADEQUADO' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'}
                 `}>
                    <div className="flex-shrink-0 text-center px-4">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 mx-auto
                          ${report.packagingCompatibility.suitability === 'ADEQUADO' ? 'bg-emerald-100 text-emerald-600' : 
                            report.packagingCompatibility.suitability === 'INADEQUADO' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}
                       `}>
                          <i className={`fa-solid ${getContainerIcon()}`}></i>
                       </div>
                       <p className="text-xs font-bold uppercase tracking-wide opacity-70">Embalagem</p>
                    </div>
                    <div className="flex-1">
                       <h3 className={`text-xl font-bold mb-2
                          ${report.packagingCompatibility.suitability === 'ADEQUADO' ? 'text-emerald-900' : 
                            report.packagingCompatibility.suitability === 'INADEQUADO' ? 'text-red-900' : 'text-amber-900'}
                       `}>
                          Compatibilidade: {report.packagingCompatibility.suitability}
                       </h3>
                       <p className="text-sm text-slate-700 mb-4 italic">
                          "{report.packagingCompatibility.recommendation}"
                       </p>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white/60 p-2 rounded">
                             <strong>Proteção UV:</strong> {report.packagingCompatibility.protectionAnalysis.uvProtection}
                          </div>
                          <div className="bg-white/60 p-2 rounded">
                             <strong>Proteção Umidade:</strong> {report.packagingCompatibility.protectionAnalysis.moistureProtection}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 2. Matriz de Interações (Sinergia vs Antagonismo) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                       <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <i className="fa-solid fa-triangle-exclamation text-red-500"></i> Interações Negativas & Riscos
                       </h3>
                       <div className="space-y-3">
                          {report.interactions.filter(i => i.type === 'ANTAGONISMO' || i.type === 'DEGRADACAO').length === 0 && (
                             <p className="text-sm text-emerald-600 italic">Nenhuma interação negativa crítica detectada.</p>
                          )}
                          {report.interactions.filter(i => i.type === 'ANTAGONISMO' || i.type === 'DEGRADACAO').map((interaction, idx) => (
                             <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-red-800">{interaction.compoundsinvolved}</span>
                                   <span className="text-[10px] bg-red-200 text-red-800 px-1 rounded uppercase font-bold">{interaction.type}</span>
                                </div>
                                <p className="text-xs text-red-700">{interaction.description}</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                       <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <i className="fa-solid fa-atom text-emerald-500"></i> Sinergias & Pontos Fortes
                       </h3>
                       <div className="space-y-3">
                          {report.interactions.filter(i => i.type === 'SINERGISMO' || i.type === 'NEUTRO').length === 0 && (
                             <p className="text-sm text-slate-400 italic">Nenhuma sinergia específica destacada.</p>
                          )}
                          {report.interactions.filter(i => i.type === 'SINERGISMO').map((interaction, idx) => (
                             <div key={idx} className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-emerald-800">{interaction.compoundsinvolved}</span>
                                   <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded uppercase font-bold">SINERGIA</span>
                                </div>
                                <p className="text-xs text-emerald-700">{interaction.description}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 3. Tabela Detalhada de Ingredientes COM FORMA QUÍMICA */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                       <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                          <i className="fa-solid fa-list-check"></i> Análise Individual de Estabilidade
                       </h3>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                             <tr>
                                <th className="px-4 py-3">Ingrediente & Forma</th>
                                <th className="px-4 py-3 text-center">Fotossensível?</th>
                                <th className="px-4 py-3">Problemas de Estabilidade</th>
                                <th className="px-4 py-3">Obs. Técnica</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {report.ingredientsAnalysis.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                   <td className="px-4 py-3 font-medium text-slate-800">
                                      <span className="block text-slate-900 font-bold">{item.name}</span>
                                      <span className="block text-xs text-blue-600 font-mono mt-0.5">{item.chemicalForm}</span>
                                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{item.chemicalFunction}</span>
                                   </td>
                                   <td className="px-4 py-3 text-center">
                                      {item.isPhotosensitive ? (
                                         <span className="text-amber-500 text-lg" title="Fotossensível"><i className="fa-solid fa-sun"></i></span>
                                      ) : (
                                         <span className="text-slate-200"><i className="fa-regular fa-sun"></i></span>
                                      )}
                                   </td>
                                   <td className="px-4 py-3 text-slate-600 text-xs">
                                      {item.stabilityIssues}
                                   </td>
                                   <td className="px-4 py-3 text-slate-500 text-xs italic">
                                      {item.observation}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* 4. Físico-Química e Armazenamento */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 uppercase mb-3 flex items-center gap-2">
                           <i className="fa-solid fa-droplet text-blue-500"></i> pH Ideal Sugerido
                        </h3>
                        <div className="flex items-center gap-4">
                           <div className="text-3xl font-bold text-blue-700">{report.optimalPH}</div>
                           <p className="text-xs text-blue-800 leading-snug">
                              Faixa de pH estimada para maximizar a estabilidade química dos ativos desta fórmula.
                           </p>
                        </div>
                    </div>

                    <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                           <i className="fa-solid fa-temperature-arrow-down text-slate-500"></i> Armazenamento
                        </h3>
                        <ul className="space-y-2">
                           {report.storageRecommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                                 <i className="fa-solid fa-box text-slate-400 mt-0.5"></i>
                                 {rec}
                              </li>
                           ))}
                        </ul>
                    </div>
                 </div>

                 {/* 5. Simulação de Shelf-Life (GRAFICO DE BARRAS) */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase flex items-center gap-2">
                         <i className="fa-solid fa-clock-rotate-left text-blue-400"></i> Simulação de Shelf-Life (Prateleira)
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border 
                         ${report.shelfLifeForecast.overallStabilityVerdict === 'ESTAVEL' ? 'bg-emerald-900 border-emerald-500 text-emerald-400' : 
                           report.shelfLifeForecast.overallStabilityVerdict === 'CRITICO' ? 'bg-red-900 border-red-500 text-red-400' : 'bg-amber-900 border-amber-500 text-amber-400'}
                      `}>
                         Veredito: {report.shelfLifeForecast.overallStabilityVerdict}
                      </span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      
                      {/* 12 Meses */}
                      <div className="p-6 flex flex-col h-full">
                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <i className="fa-regular fa-calendar text-blue-500"></i> Após 12 Meses
                         </h4>
                         <p className="text-sm text-slate-800 leading-relaxed font-medium mb-6">
                            "{report.shelfLifeForecast.at12Months}"
                         </p>
                         
                         {/* Gráfico de Barras 12m */}
                         <div className="mt-auto pt-4 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Estimativa de Potência Restante</p>
                            <div className="space-y-3">
                               {report.shelfLifeForecast.decayStats.map((stat, idx) => (
                                  <div key={idx}>
                                     <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                                        <span className="font-semibold truncate pr-2">{stat.ingredientName}</span>
                                        <span className="font-bold">{stat.remainingPercentageAt12m}%</span>
                                     </div>
                                     <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${getDecayColor(stat.remainingPercentageAt12m)}`} 
                                          style={{ width: `${stat.remainingPercentageAt12m}%` }}
                                        ></div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* 24 Meses */}
                      <div className="p-6 flex flex-col h-full">
                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-calendar-days text-purple-500"></i> Após 24 Meses
                         </h4>
                         <p className="text-sm text-slate-800 leading-relaxed font-medium mb-6">
                            "{report.shelfLifeForecast.at24Months}"
                         </p>

                         {/* Gráfico de Barras 24m */}
                         <div className="mt-auto pt-4 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Estimativa de Potência Restante</p>
                            <div className="space-y-3">
                               {report.shelfLifeForecast.decayStats.map((stat, idx) => (
                                  <div key={idx}>
                                     <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                                        <span className="font-semibold truncate pr-2">{stat.ingredientName}</span>
                                        <span className="font-bold">{stat.remainingPercentageAt24m}%</span>
                                     </div>
                                     <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${getDecayColor(stat.remainingPercentageAt24m)}`} 
                                          style={{ width: `${stat.remainingPercentageAt24m}%` }}
                                        ></div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                 </div>

                 {/* 6. Sugestões de Melhoria */}
                 <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <h3 className="text-sm font-bold text-purple-900 uppercase mb-3 flex items-center gap-2">
                       <i className="fa-solid fa-wand-magic-sparkles"></i> Sugestões de Otimização da Fórmula
                    </h3>
                    <ul className="space-y-2">
                       {report.improvements.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                             <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                             {imp}
                          </li>
                       ))}
                    </ul>
                 </div>

                 {/* RODAPÉ DE REFERÊNCIAS BIBLIOGRÁFICAS */}
                 <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Referências Bibliográficas Utilizadas na Análise:</h3>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                        {report.bibliographicReferences.map((ref, idx) => (
                            <li key={idx}>{ref}</li>
                        ))}
                    </ul>
                    <div className="text-center mt-6">
                        <p className="text-[10px] text-slate-300">
                           Este laudo técnico foi elaborado pelo Setor de Planejamento e Análise de Produtos para fins de orientação prévia.
                           A validação final de estabilidade deve ser realizada através de testes de prateleira reais (estufa/climática).
                        </p>
                    </div>
                 </div>

             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FormulaAnalyzer;
