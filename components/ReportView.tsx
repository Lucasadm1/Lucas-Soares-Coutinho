
import React, { useState } from 'react';
import { TechnicalSheet } from '../types';

interface ReportViewProps {
  data: TechnicalSheet;
  imageSrc: string | null;
}

const ReportView: React.FC<ReportViewProps> = ({ data, imageSrc }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const element = document.getElementById('report-content');
    
    // Configurações para o html2pdf
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Ficha_${data.identificacao_geral.nome_produto.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
      alert("Houve um erro ao gerar o arquivo PDF. Tentando impressão padrão.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:max-w-none print:w-full">
      
      {/* Header / Actions - Hidden on Print */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center no-print">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fa-solid fa-file-invoice"></i> Ficha Técnica de Produto
        </h2>
        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isDownloading ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i> Gerando PDF...
            </>
          ) : (
            <>
              <i className="fa-solid fa-file-pdf"></i> Baixar PDF
            </>
          )}
        </button>
      </div>

      {/* Report Content */}
      <div id="report-content" className="p-8 md:p-12 print:p-0 bg-white">
        
        {/* CABEÇALHO DO PRODUTO */}
        <div className="border-b-2 border-slate-100 pb-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 print:w-1/3">
            {imageSrc && (
              <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative shadow-sm">
                 <img 
                  src={imageSrc} 
                  alt="Item analisado" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identificação Visual</p>
              <p className="text-slate-800 font-bold text-sm mt-1">{data.identificacao_geral.identificacao_visual}</p>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 print:w-2/3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1 block">
                  {data.identificacao_geral.marca_fabricante}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                  {data.identificacao_geral.nome_produto}
                </h1>
              </div>
              <div className="text-right hidden print:block">
                 <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded">VisionAnalyst Pro</div>
              </div>
            </div>
            
            <div className="mb-6">
               <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md font-semibold uppercase tracking-wide border border-slate-200">
                  {data.identificacao_geral.categoria_produto}
               </span>
            </div>
            
            <div className="prose prose-sm text-slate-600 leading-relaxed mb-6">
              <h3 className="text-slate-900 font-bold text-sm uppercase mb-1">Contexto & Definição</h3>
              <p>{data.identificacao_geral.contexto_definicao}</p>
            </div>

             <div className="bg-slate-50 border border-slate-100 rounded-lg p-5">
              <h3 className="text-slate-700 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                <i className="fa-solid fa-flask"></i> Fórmula & Conteúdo
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                 <div className="col-span-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Tipo de Fórmula</span>
                    <p className="text-sm font-medium text-slate-800">{data.formula_e_conteudo.tipo_formula}</p>
                 </div>
                 <div className="col-span-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Principais Ativos</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                       {data.formula_e_conteudo.principais_compostos.map((item, idx) => (
                          <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-700">{item}</span>
                       ))}
                    </div>
                 </div>
                 <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Apresentação</span>
                    <p className="text-sm font-medium text-slate-800">{data.formula_e_conteudo.informacoes_quantitativas.forma_farmaceutica}</p>
                 </div>
                 <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Conteúdo</span>
                    <p className="text-sm font-medium text-slate-800">{data.formula_e_conteudo.informacoes_quantitativas.quantidade_unidades} ({data.formula_e_conteudo.informacoes_quantitativas.peso_liquido})</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENGENHARIA & LOGÍSTICA */}
        <div className="mb-8">
           <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fa-solid fa-ruler-combined text-blue-600"></i> Engenharia & Logística
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Dimensões Card */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                 <h4 className="text-blue-800 font-bold text-xs uppercase mb-3 border-b border-blue-200 pb-2">Dimensões & Peso Estimados</h4>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                       <i className="fa-solid fa-arrows-up-down text-blue-400 mb-1 text-sm"></i>
                       <p className="text-[10px] text-blue-500 uppercase font-bold">Altura</p>
                       <p className="text-sm font-bold text-slate-800">{data.engenharia_logistica.altura_estimada}</p>
                    </div>
                    <div className="text-center border-l border-blue-200">
                       <i className="fa-solid fa-arrows-left-right text-blue-400 mb-1 text-sm"></i>
                       <p className="text-[10px] text-blue-500 uppercase font-bold">Largura</p>
                       <p className="text-sm font-bold text-slate-800">{data.engenharia_logistica.largura_estimada}</p>
                    </div>
                    <div className="text-center border-l border-blue-200">
                       <i className="fa-solid fa-weight-hanging text-blue-400 mb-1 text-sm"></i>
                       <p className="text-[10px] text-blue-500 uppercase font-bold">Peso</p>
                       <p className="text-sm font-bold text-slate-800">{data.engenharia_logistica.peso_estimado}</p>
                    </div>
                 </div>
                 <div className="mt-4 pt-3 border-t border-blue-200 space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-semibold text-blue-500 uppercase">Recipiente</span>
                       <span className="text-sm font-bold text-slate-800">{data.engenharia_logistica.tipo_recipiente}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-semibold text-blue-500 uppercase">Tampa</span>
                       <span className="text-sm font-bold text-slate-800">{data.engenharia_logistica.sistema_fechamento}</span>
                    </div>
                    <div className="text-xs text-slate-600 italic bg-blue-100/50 p-2 rounded">
                       <i className="fa-solid fa-info-circle mr-1"></i> {data.engenharia_logistica.informacoes_logisticas}
                    </div>
                 </div>
              </div>

              {/* Análise de Materiais Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                 <h4 className="text-slate-700 font-bold text-xs uppercase mb-3 border-b border-slate-200 pb-2">Materiais da Embalagem</h4>
                 <div className="space-y-4">
                    
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Material Principal</span>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-cube text-purple-500"></i>
                        <span className="text-base font-bold text-slate-900">{data.materiais_embalagem.material_principal}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                         Família: {data.materiais_embalagem.familia_material} | Acabamento: {data.materiais_embalagem.acabamento_superficial}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Componentes Secundários</span>
                       <p className="text-sm text-slate-700">{data.materiais_embalagem.componentes_secundarios}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Reciclabilidade Estimada</span>
                       <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                          <i className="fa-solid fa-recycle"></i> {data.materiais_embalagem.reciclabilidade}
                       </p>
                    </div>
                 </div>
              </div>

           </div>
           <p className="text-[10px] text-slate-400 mt-2 italic text-right">
             * A identificação de materiais é uma estimativa baseada em propriedades ópticas (brilho, transparência) e padrões industriais.
           </p>
        </div>

        {/* VISUAL & CORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
          
          {/* Column 1: Visual Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-slate-500 pl-3">
                Análise Visual da Cena
              </h3>
              
              <div className="bg-slate-50 p-4 rounded border border-slate-100 mb-4">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-1">Vibe / Atmosfera</p>
                 <p className="text-slate-800 font-medium text-sm">{data.analise_visual.vibe}</p>
              </div>

              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                "{data.analise_visual.descricao_visual}"
              </p>
              
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-1">Público-Alvo Estimado</p>
                 <p className="text-slate-800 font-medium text-xs">{data.analise_visual.publico_alvo}</p>
              </div>
            </div>
            
            <div>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-green-500 pl-3">
                 Certificações & Selos Visíveis
               </h3>
               {data.formula_e_conteudo.certificacoes_selos && data.formula_e_conteudo.certificacoes_selos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                     {data.formula_e_conteudo.certificacoes_selos.map((selo, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-200 font-bold flex items-center gap-1">
                           <i className="fa-solid fa-certificate"></i> {selo}
                        </span>
                     ))}
                  </div>
               ) : (
                  <p className="text-sm text-slate-400 italic">Nenhum selo identificado visualmente.</p>
               )}
            </div>
          </div>

          {/* Column 2: Color Palette */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-3">
              Paleta Cromática
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4">
              <div className="space-y-4">
                {data.paleta_cromatica.cores_principais.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div 
                      className="w-14 h-14 rounded-lg shadow-sm border border-slate-200 flex-shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </div>
                    <div className="flex-1 min-w-0 flex justify-between items-center border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{color.nome}</p>
                        <p className="text-xs text-slate-400 font-mono uppercase">{color.hex}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {color.proporcao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-slate-500 italic bg-white p-3 rounded border border-slate-200">
               <strong>Análise de Uso:</strong> {data.paleta_cromatica.analise_uso_cores}
            </div>
          </div>

        </div>

        {/* CONCLUSÃO */}
        <div className="mt-8 p-6 bg-slate-100 rounded-xl border border-slate-200">
           <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Resumo Técnico & Limitações</h3>
           <p className="text-sm text-slate-800 mb-3 font-medium">{data.resumo_e_limitacoes.resumo_tecnico}</p>
           <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-3">
              <i className="fa-solid fa-triangle-exclamation mr-1"></i> {data.resumo_e_limitacoes.limitacoes}
           </p>
        </div>

        {/* Footer for Print */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center hidden print:block">
          <p className="text-xs text-slate-400">Relatório técnico emitido pelo VisionAnalyst Pro.</p>
          <p className="text-[10px] text-slate-300 mt-1">{new Date().toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
};

export default ReportView;
