import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { generateMockup } from '../services/geminiService';

const MockupGenerator: React.FC = () => {
  const [productImage, setProductImage] = useState<{ file: File; preview: string } | null>(null);
  const [labelImage, setLabelImage] = useState<{ file: File; preview: string } | null>(null);
  const [instructions, setInstructions] = useState("");
  const [labelFit, setLabelFit] = useState<string>("wrap"); // wrap, front, sticker
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProductSelect = (file: File) => {
    setProductImage({ file, preview: URL.createObjectURL(file) });
    setResultImage(null);
  };

  const handleLabelSelect = (file: File) => {
    setLabelImage({ file, preview: URL.createObjectURL(file) });
    setResultImage(null);
  };

  const handleGenerate = async () => {
    if (!productImage || !labelImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedImageBase64 = await generateMockup(
        productImage.file, 
        labelImage.file, 
        instructions,
        labelFit
      );
      setResultImage(generatedImageBase64);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar o mockup. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `mockup_gerado_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Gerador de Mockup IA
        </h1>
        <p className="text-slate-600">
          Combine a foto do seu produto com a arte do rótulo e personalize os detalhes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative">
        {/* Coluna 1: Produto */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
             <h3 className="font-bold text-slate-800">Modelo do Produto</h3>
          </div>
          
          {productImage ? (
            <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50 flex items-center justify-center">
              <img src={productImage.preview} alt="Produto" className="max-w-full max-h-full object-contain" />
              <button 
                onClick={() => setProductImage(null)}
                className="absolute top-2 right-2 bg-white/90 text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                title="Remover imagem"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ) : (
            <ImageUpload 
              onImageSelected={handleProductSelect} 
              title="Arraste o pote/garrafa aqui"
              showNotes={false}
              icon="fa-bottle-water"
            />
          )}
          <p className="text-xs text-slate-400 mt-2 text-center">A foto do objeto onde o rótulo será aplicado.</p>
        </div>

        {/* Ícone de Mais no meio (Desktop) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow border border-slate-100 text-slate-400">
          <i className="fa-solid fa-plus text-xl"></i>
        </div>

        {/* Coluna 2: Rótulo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
             <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
             <h3 className="font-bold text-slate-800">Arte do Rótulo</h3>
          </div>

          {labelImage ? (
            <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50 flex items-center justify-center">
              <img src={labelImage.preview} alt="Rótulo" className="max-w-full max-h-full object-contain" />
              <button 
                onClick={() => setLabelImage(null)}
                className="absolute top-2 right-2 bg-white/90 text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                title="Remover imagem"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ) : (
            <ImageUpload 
              onImageSelected={handleLabelSelect} 
              title="Arraste a arte do rótulo aqui"
              showNotes={false}
              icon="fa-scroll"
            />
          )}
          <p className="text-xs text-slate-400 mt-2 text-center">A imagem plana do design/arte do rótulo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Seletor de Tipo de Aplicação (Para corrigir tamanho) */}
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-arrows-left-right-to-line text-blue-500"></i> Tamanho da Aplicação
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setLabelFit('wrap')}
              className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                labelFit === 'wrap' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className="fa-solid fa-expand"></i>
              Envolvente
              <span className="text-[10px] opacity-70">Cobre todo corpo</span>
            </button>
            <button
              onClick={() => setLabelFit('front')}
              className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                labelFit === 'front' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className="fa-regular fa-square"></i>
              Frontal
              <span className="text-[10px] opacity-70">Padrão Mercado</span>
            </button>
             <button
              onClick={() => setLabelFit('sticker')}
              className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                labelFit === 'sticker' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className="fa-solid fa-tag"></i>
              Adesivo
              <span className="text-[10px] opacity-70">Menor/Logo</span>
            </button>
          </div>
        </div>

        {/* Campo de Instruções de Personalização */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-wand-sparkles text-amber-500"></i> Personalização (Opcional)
          </label>
          <div className="relative">
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex: Mude a cor da tampa para dourado, vidro fosco..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-700 placeholder-slate-400 shadow-sm resize-none h-[74px] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Botão de Ação */}
      <div className="flex flex-col items-center justify-center mb-12">
        <button
          onClick={handleGenerate}
          disabled={!productImage || !labelImage || isGenerating}
          className={`
            px-8 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center gap-3 transition-all transform hover:scale-105
            ${(!productImage || !labelImage) 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : isGenerating
                ? 'bg-blue-800 text-blue-200 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
            }
          `}
        >
          {isGenerating ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i> Processando Mockup...
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles"></i> Gerar Mockup Realista
            </>
          )}
        </button>
        {(!productImage || !labelImage) && !isGenerating && (
          <p className="text-xs text-slate-400 mt-3 animate-pulse">
            Selecione ambas as imagens para continuar
          </p>
        )}
      </div>

      {/* Exibição do Erro */}
      {error && (
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8 text-center text-sm">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}

      {/* Exibição do Resultado */}
      {resultImage && (
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <i className="fa-solid fa-image"></i> Resultado Final
            </h3>
            <button 
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-download"></i> Baixar Imagem
            </button>
          </div>
          
          <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 flex justify-center">
            <img 
              src={resultImage} 
              alt="Mockup Gerado" 
              className="max-w-full rounded-lg shadow-xl border border-white/50" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MockupGenerator;