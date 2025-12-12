
import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { analyzeLabelCompliance } from '../services/geminiService';
import { ComplianceReport } from '../types';

const ComplianceChecker: React.FC = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Estados para Contexto do Produto (RDC 990)
  const [productStatus, setProductStatus] = useState<'NEW' | 'EXISTING'>('NEW');
  const [launchDate, setLaunchDate] = useState<string>("");
  
  // Estados para Informações Adicionais
  const [userNotes, setUserNotes] = useState("");
  const [includeNotesInReport, setIncludeNotesInReport] = useState(false);

  const handleImageSelect = async (file: File) => {
    // Validação básica
    if (productStatus === 'EXISTING' && !launchDate) {
      alert("Por favor, informe a data aproximada de lançamento/CIF para verificar a regra de transição.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const data = await analyzeLabelCompliance(file, {
        isNewProduct: productStatus === 'NEW',
        launchDate: launchDate,
        userNotes: userNotes,
        includeNotesInReport: includeNotesInReport
      });
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Erro ao analisar o rótulo. Verifique se a imagem está nítida.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const element = document.getElementById('compliance-report-content');
    
    // Configurações para html2pdf mantendo o visual "rico"
    const options = {
      margin: [10, 10, 10, 10], // Margem de 10mm
      filename: `Parecer_ANVISA_${report?.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'rotulo'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        windowWidth: 1024 // Força largura de desktop para o PDF ficar bonito
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

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'BAIXO': return 'bg-emerald-500 text-white';
      case 'MEDIO': return 'bg-amber-500 text-white';
      case 'ALTO': return 'bg-orange-600 text-white';
      case 'CRITICO': return 'bg-red-700 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  if (!report && !loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Auditoria de Rótulos ANVISA
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Verifique a conformidade com a RDC 243/2018, NT 43/2025 e analise prazos da RDC 843/2024 (atualizada pela RDC 990/2025).
          </p>
        </div>
        
        {/* Bloco de Contexto do Produto */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
            <i className="fa-solid fa-calendar-check text-blue-600"></i>
            Contexto da Análise
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Situação do Produto</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={productStatus === 'NEW'} 
                    onChange={() => setProductStatus('NEW')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Lançamento (Novo)</span>
                    <span className="block text-xs text-slate-500">Produto a ser lançado agora</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={productStatus === 'EXISTING'} 
                    onChange={() => setProductStatus('EXISTING')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Já no Mercado</span>
                    <span className="block text-xs text-slate-500">Possui histórico/CIF anterior</span>
                  </div>
                </label>
              </div>
            </div>

            <div className={`transition-opacity ${productStatus === 'EXISTING' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data Aprox. do Lançamento / CIF
              </label>
              <input 
                type="date" 
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              />
              <p className="text-xs text-slate-500 mt-2 leading-tight">
                Necessário para verificar se o produto se enquadra na extensão de prazo da <strong>RDC 990/2025</strong> (até 01/09/2026).
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <label htmlFor="complianceNotes" className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                <span>Informações Prévias / Observações</span>
                <span className="text-xs text-slate-400 font-normal">Opcional</span>
             </label>
             <textarea
                id="complianceNotes"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={3}
                placeholder="Cole aqui a lista de ingredientes, dúvidas específicas ou detalhes que ajudem na análise..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-sm resize-none"
             />
             <div className="mt-2 flex items-center">
                <input 
                  type="checkbox" 
                  id="includeNotes" 
                  checked={includeNotesInReport}
                  onChange={(e) => setIncludeNotesInReport(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300 mr-2"
                />
                <label htmlFor="includeNotes" className="text-xs text-slate-600 cursor-pointer select-none">
                  Incluir este texto explicitamente no laudo final (PDF)?
                </label>
             </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            <span>{error}</span>
          </div>
        )}

        <ImageUpload 
          onImageSelected={(file) => handleImageSelect(file)} 
          title="Carregar Rótulo para Análise" 
          icon="fa-file-contract"
          showNotes={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse max-w-4xl mx-auto">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-semibold text-slate-800">Auditando Rótulo...</h3>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          O sistema está verificando alegações funcionais (NT 43/2025), regularização e aplicando as regras de transição da RDC 990/2025.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up pb-12">
      
      <div className="mb-6 flex justify-between items-center no-print">
        <button 
          onClick={() => setReport(null)}
          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i> Nova Auditoria
        </button>
        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isDownloading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
          Baixar Parecer
        </button>
      </div>

      <div id="compliance-report-content" className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-100">
        
        {/* CABEÇALHO DO PARECER */}
        <div className="bg-slate-900 text-white p-8 border-b-4 border-emerald-500 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h2 className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-1">FICHA TÉCNICA</h2>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Parecer de Rotulagem</h1>
            <p className="text-slate-300 text-sm">Produto Analisado: <strong className="text-white">{report?.productName}</strong></p>
            <p className="text-slate-400 text-xs mt-1">Data: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="text-right flex flex-col items-end justify-center">
             <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase mb-2 ${getSeverityColor(report?.finalOpinion.severityLevel || 'BAIXO')}`}>
                Risco: {report?.finalOpinion.severityLevel}
             </div>
             <p className="text-xs text-slate-400">RDC 843/24, IN 281/24, NT 43/25</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">

          {/* ALERTA VISUAL DE TABELA NUTRICIONAL INCORRETA (Fundo Preto, etc) */}
          {report?.mandatoryChecks.some(c => c.item.includes("Layout Tabela") && c.status === 'NAO_CONFORME') && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start gap-3 animate-pulse">
              <div className="text-red-500 text-2xl mt-1"><i className="fa-solid fa-palette"></i></div>
              <div>
                <h3 className="text-red-800 font-bold uppercase">Erro Crítico de Design: Tabela Nutricional</h3>
                <p className="text-red-700 text-sm mt-1">
                  A Tabela Nutricional apresenta fundo colorido, invertido (preto) ou transparente. 
                  <strong>A IN 75/2020 (Anexo XII) EXIGE Fundo Branco com Caracteres Pretos.</strong>
                </p>
              </div>
            </div>
          )}

          {/* 1. VISÃO GERAL (IMAGEM + RESUMO) */}
          <div className="flex flex-col md:flex-row gap-8 items-start border-b border-slate-200 pb-8">
             {/* Imagem do Rótulo Analisado */}
             <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 shadow-sm">
                   {imagePreview && (
                     <img 
                       src={imagePreview} 
                       alt="Rótulo Analisado" 
                       className="w-full h-auto rounded object-contain max-h-[300px] mx-auto" 
                     />
                   )}
                   <p className="text-[10px] text-center text-slate-400 mt-2 font-medium uppercase tracking-wide">
                     Imagem Auditada
                   </p>
                </div>
                {/* Contexto do Produto no Relatório */}
                <div className="mt-4 bg-slate-100 p-3 rounded text-center border border-slate-200">
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Contexto Informado</p>
                   <p className="text-sm font-bold text-slate-800">
                     {productStatus === 'NEW' ? "Lançamento (Novo Produto)" : "Produto Já no Mercado"}
                   </p>
                   {launchDate && <p className="text-xs text-slate-600 mt-1">Data Base: {new Date(launchDate).toLocaleDateString()}</p>}
                </div>
             </div>

             {/* Diagnóstico Geral */}
             <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-magnifying-glass-chart text-blue-600"></i>
                  Diagnóstico Geral
                </h3>
                
                {report?.userNotes && (
                   <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 text-sm text-amber-900">
                      <p className="text-xs font-bold uppercase text-amber-700 mb-1">Observações do Solicitante:</p>
                      "{report.userNotes}"
                   </div>
                )}

                <p className="text-slate-700 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                   {report?.finalOpinion.summary}
                </p>
                
                {/* Enquadramento Regulatório Simples */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                   <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1 flex items-center gap-1">
                     <i className="fa-solid fa-scale-balanced"></i> Parecer Rápido
                   </h4>
                   <p className="text-xs text-emerald-700">
                     {report?.finalOpinion.regulatoryEnquadramento || "Análise preliminar indisponível."}
                   </p>
                </div>
             </div>
          </div>

          {/* 2. ANÁLISE DE ALEGAÇÕES (NT 43/2025) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                   <i className="fa-solid fa-book-medical text-blue-600"></i>
                   Alegações Funcionais (Exigência de Texto Exato)
                </h3>
                <span className="text-[10px] text-slate-400">NT 43/2025</span>
             </div>
             
             <div className="divide-y divide-slate-100">
                {report?.claimsAnalysis && report.claimsAnalysis.length > 0 ? (
                  report.claimsAnalysis.map((claim, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{claim.nutrientOrSubject}</span>
                                
                                {claim.officialComparison === 'PLENAMENTE_RECONHECIDA' && (
                                   <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1"><i className="fa-solid fa-check"></i> Texto Idêntico</span>
                                )}
                                {(claim.officialComparison === 'DIVERGENTE_TEXTO' || claim.officialComparison === 'DIVERGENTE_SENTIDO') && (
                                   <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                     <i className="fa-solid fa-triangle-exclamation"></i> Variação Textual (Proibido)
                                   </span>
                                )}
                             </div>
                             <p className="text-sm font-semibold text-slate-800 italic">"{claim.claimTextFound}"</p>
                             {claim.officialComparison !== 'PLENAMENTE_RECONHECIDA' && (
                               <p className="text-xs text-red-500 mt-1">O texto deve ser idêntico ao da legislação, sem sinônimos.</p>
                             )}
                          </div>
                          
                          <div className="md:w-1/3 flex flex-col items-end gap-1">
                             <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                                claim.quantityCheck === 'ADEQUADA' ? 'bg-emerald-100 text-emerald-700' :
                                claim.quantityCheck === 'INSUFICIENTE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                             }`}>
                                {claim.quantityCheck === 'ADEQUADA' ? <i className="fa-solid fa-flask"></i> : <i className="fa-solid fa-flask-vial"></i>}
                                Dose: {claim.quantityCheck.replace('_', ' ')}
                             </div>
                             <p className="text-[10px] text-slate-500 text-right">{claim.observation}</p>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    Nenhuma alegação funcional identificada no rótulo.
                  </div>
                )}
             </div>
          </div>

          {/* 3. REGULARIZAÇÃO SANITÁRIA (RDC 843/2024 + RDC 990/2025) */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md relative">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
             <div className="p-5">
                <h3 className="text-base font-bold text-indigo-900 mb-4 flex items-center gap-2">
                   <i className="fa-solid fa-building-columns text-indigo-600"></i>
                   Regularização Sanitária (RDC 843/2024 & RDC 990/2025)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                   <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Enquadramento Provável</p>
                      <p className="text-lg font-bold text-indigo-900">{report?.sanitaryRegularization.probableType}</p>
                      <p className="text-xs text-indigo-600 mt-1">{report?.sanitaryRegularization.regulatoryRiskComment}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Frase no Rótulo</p>
                      <p className="text-base font-medium text-slate-800 italic">"{report?.sanitaryRegularization.labelPhraseFound}"</p>
                      <div className="mt-2">
                         {report?.sanitaryRegularization.coherence === 'COERENTE' ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> Coerente</span>
                         ) : (
                            <span className="text-xs font-bold text-red-600 flex items-center gap-1"><i className="fa-solid fa-circle-exclamation"></i> {report?.sanitaryRegularization.coherence.replace('_', ' ')}</span>
                         )}
                      </div>
                   </div>
                </div>

                {report?.sanitaryRegularization.transitionalSituations && report?.sanitaryRegularization.transitionalSituations !== "Não se aplica" && (
                   <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded text-sm text-amber-800">
                      <strong><i className="fa-solid fa-right-left"></i> Situação de Transição (Arts. 30-33 / RDC 990):</strong> 
                      <p className="mt-1 leading-relaxed">{report.sanitaryRegularization.transitionalSituations}</p>
                   </div>
                )}

                <div>
                   <p className="text-xs font-bold text-slate-500 uppercase mb-2">Recomendações Práticas (Regularização)</p>
                   <ul className="list-disc list-inside space-y-1">
                      {report?.sanitaryRegularization.practicalRecommendations.map((rec, idx) => (
                         <li key={idx} className="text-sm text-slate-700">{rec}</li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>

          {/* ADVERTÊNCIAS OBRIGATÓRIAS (ANEXO VI) - NOVO */}
          {report?.mandatoryComponentWarnings && report.mandatoryComponentWarnings.length > 0 && (
             <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
               <h3 className="text-base font-bold text-amber-800 flex items-center gap-2 mb-3">
                 <i className="fa-solid fa-triangle-exclamation"></i> Advertências de Ingredientes Específicos (Anexo VI)
               </h3>
               <p className="text-xs text-amber-700 mb-3">
                 A análise dos ingredientes detectou que as seguintes advertências <strong>DEVEM</strong> constar no rótulo devido à presença de constituintes específicos (IN 76/2020):
               </p>
               <ul className="list-disc list-inside space-y-2">
                 {report.mandatoryComponentWarnings.map((warning, idx) => (
                   <li key={idx} className="text-sm text-amber-900 font-bold bg-amber-100/50 p-2 rounded border border-amber-200/50">
                     "{warning}"
                   </li>
                 ))}
               </ul>
             </div>
          )}

          {/* 4. CHECKLISTS DE CONFORMIDADE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Obrigatórios */}
            <div>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <i className="fa-solid fa-check text-emerald-600"></i> Checklist Obrigatório
               </h3>
               <div className="space-y-0 text-sm">
                  {report?.mandatoryChecks.map((check, idx) => (
                    <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
                       <div className="pr-2">
                          <p className="font-semibold text-slate-800">{check.item}</p>
                          {check.status !== 'CONFORME' && (
                            <p className="text-xs text-red-600 mt-0.5">{check.observation}</p>
                          )}
                       </div>
                       <div className="flex-shrink-0">
                          {check.status === 'CONFORME' ? (
                            <i className="fa-solid fa-circle-check text-emerald-500"></i>
                          ) : check.status === 'NAO_CONFORME' ? (
                             <i className="fa-solid fa-circle-xmark text-red-500"></i>
                          ) : (
                             <i className="fa-solid fa-circle-question text-slate-300"></i>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Proibições & Alertas */}
            <div>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <i className="fa-solid fa-triangle-exclamation text-amber-500"></i> Checklist de Proibições
               </h3>
               
               <div className="space-y-3">
                 {report?.prohibitedChecks.filter(c => c.status !== 'CONFORME').length === 0 && (
                    <p className="text-sm text-emerald-600 italic bg-emerald-50 p-2 rounded border border-emerald-100">
                      <i className="fa-solid fa-shield-check mr-2"></i>
                      Nenhuma imagem ou alegação proibida detectada visualmente.
                    </p>
                 )}
                 {report?.prohibitedChecks.filter(c => c.status !== 'CONFORME').map((check, idx) => (
                   <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-red-800 text-xs uppercase">{check.item}</span>
                        <span className="text-[10px] bg-red-200 text-red-800 px-1 rounded font-bold">PROIBIDO</span>
                      </div>
                      <p className="text-xs text-red-700 leading-snug">{check.observation}</p>
                   </div>
                 ))}
               </div>

               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-6 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <i className="fa-solid fa-flask text-purple-600"></i> Outras Análises de Fórmula
               </h3>
               <div className="space-y-2">
                 {report?.formulaAnalysis.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                      <span>{item.item}</span>
                      <span className="font-bold text-slate-600">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* 5. PLANO DE AÇÃO */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clipboard-list text-slate-700"></i> Plano de Ação Corretiva
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Correções Obrigatórias</h4>
                   <ul className="space-y-2">
                      {report?.finalOpinion.finalRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-800">
                           <span className="text-red-500 font-bold">•</span>
                           {rec}
                        </li>
                      ))}
                      {report?.finalOpinion.finalRecommendations.length === 0 && (
                        <li className="text-sm text-slate-500 italic">Nenhuma correção obrigatória identificada.</li>
                      )}
                   </ul>
                </div>
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Riscos Regulatórios</h4>
                   <ul className="space-y-2">
                      {report?.finalOpinion.regulatoryRisks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                           <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs mt-1"></i>
                           {risk}
                        </li>
                      ))}
                       {report?.finalOpinion.regulatoryRisks.length === 0 && (
                        <li className="text-sm text-slate-500 italic">Baixo risco regulatório detectado.</li>
                      )}
                   </ul>
                </div>
             </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-400">
              Parecer técnico elaborado pelo Setor de Planejamento e Análise de Produtos com base na NT 43/2025, RDC 843/2024 e RDC 990/2025. Este documento deve ser validado pelo Responsável Técnico (RT).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
