
import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import ReportView from './components/ReportView';
import MockupGenerator from './components/MockupGenerator';
import ComplianceChecker from './components/ComplianceChecker';
import FormulaAnalyzer from './components/FormulaAnalyzer';
import FormulationAssistant from './components/FormulationAssistant';
import NutritionalTableTool from './components/NutritionalTableTool';
import Settings from './components/Settings';
import { analyzeImage } from './services/geminiService';
import { AnalysisState } from './types';

// Helper para replicar a lógica de ajuste de cor no boot inicial (duplicado do Settings para evitar prop drilling complexo)
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};
const rgbToHex = (r: number, g: number, b: number) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
const adjustBrightness = (hex: string, percent: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  let r = rgb.r + percent; let g = rgb.g + percent; let b = rgb.b + percent;
  r = r < 0 ? 0 : r > 255 ? 255 : r; g = g < 0 ? 0 : g > 255 ? 255 : g; b = b < 0 ? 0 : b > 255 ? 255 : b;
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
};

type ActiveTab = 'analysis' | 'mockup' | 'compliance' | 'formula' | 'formulation' | 'nutritable' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');
  
  // Apply theme on mount
  useEffect(() => {
    const savedBrand = localStorage.getItem('theme-brand');
    const savedAccent = localStorage.getItem('theme-accent');
    const savedBg = localStorage.getItem('theme-bg');

    if (savedBrand && savedAccent && savedBg) {
      const root = document.documentElement;
      const brand = savedBrand;
      const accent = savedAccent;

      root.style.setProperty('--color-bg-main', savedBg);
      root.style.setProperty('--color-accent-600', accent);
      root.style.setProperty('--color-accent-500', adjustBrightness(accent, 20));

      root.style.setProperty('--color-brand-900', adjustBrightness(brand, -60));
      root.style.setProperty('--color-brand-800', adjustBrightness(brand, -40));
      root.style.setProperty('--color-brand-700', adjustBrightness(brand, -20));
      root.style.setProperty('--color-brand-600', brand);
      root.style.setProperty('--color-brand-500', adjustBrightness(brand, 20));
      root.style.setProperty('--color-brand-400', adjustBrightness(brand, 40));
      root.style.setProperty('--color-brand-300', adjustBrightness(brand, 60));
      root.style.setProperty('--color-brand-200', adjustBrightness(brand, 120));
      root.style.setProperty('--color-brand-100', adjustBrightness(brand, 160));
      root.style.setProperty('--color-brand-50', adjustBrightness(brand, 190));
    }
  }, []);
  
  // States for Analysis Tab
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const handleImageSelect = async (selectedFile: File, userNotes: string) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setImagePreview(objectUrl);
    
    setAnalysis({ isLoading: true, error: null, data: null });

    try {
      const result = await analyzeImage(selectedFile, userNotes);
      setAnalysis({
        isLoading: false,
        error: null,
        data: result
      });
    } catch (err: any) {
      setAnalysis({
        isLoading: false,
        error: err.message || "Ocorreu um erro ao processar a imagem. Tente novamente.",
        data: null
      });
    }
  };

  const resetApp = () => {
    setFile(null);
    setImagePreview(null);
    setAnalysis({ isLoading: false, error: null, data: null });
  };

  const NavButton = ({ tab, icon, label }: { tab: ActiveTab, icon: string, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 group whitespace-nowrap
        ${activeTab === tab 
          ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/50' 
          : 'text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm'
        }
      `}
    >
      <i className={`fa-solid ${icon} ${activeTab === tab ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}></i>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-bg-main text-slate-900 pb-12 font-sans transition-colors duration-300">
      
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 no-print shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => setActiveTab('analysis')}>
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-all duration-300">
                <i className="fa-solid fa-layer-group text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight text-slate-800 leading-none">VisionAnalyst</span>
                <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-widest">Professional</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 mx-4 overflow-x-auto">
              <NavButton tab="analysis" icon="fa-microscope" label="Análise Visual" />
              <NavButton tab="mockup" icon="fa-wand-magic-sparkles" label="Mockup" />
              <NavButton tab="compliance" icon="fa-clipboard-check" label="Rótulos" />
              <NavButton tab="formula" icon="fa-flask" label="Química" />
              <NavButton tab="formulation" icon="fa-calculator" label="Formulação" />
              <NavButton tab="nutritable" icon="fa-table" label="NutriTable" />
            </div>

            {/* Right Area */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-500">v2.0</span>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'settings' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                title="Configurações"
              >
                 <i className="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-slate-100 overflow-x-auto no-scrollbar">
           <div className="flex px-4 py-3 space-x-2 min-w-max">
              <NavButton tab="analysis" icon="fa-microscope" label="Análise" />
              <NavButton tab="mockup" icon="fa-wand-magic-sparkles" label="Mockup" />
              <NavButton tab="compliance" icon="fa-clipboard-check" label="Rótulos" />
              <NavButton tab="formula" icon="fa-flask" label="Química" />
              <NavButton tab="formulation" icon="fa-calculator" label="Formulação" />
              <NavButton tab="nutritable" icon="fa-table" label="NutriTable" />
           </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- ABA 1: FICHA TÉCNICA --- */}
        {activeTab === 'analysis' && (
          <div className="animate-fade-in">
            {/* Header Section */}
            {!analysis.data && !analysis.isLoading && (
              <div className="text-center mb-12 no-print py-10">
                <div className="inline-flex items-center justify-center p-2 bg-brand-50 rounded-full mb-4 border border-brand-100">
                   <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-brand-700 shadow-sm uppercase tracking-wide">IA Vision 2.5</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">
                  Análise Técnica Inteligente
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
                  Transforme imagens de produtos em especificações técnicas detalhadas, identificação de materiais e relatórios de engenharia.
                </p>
              </div>
            )}

            {/* Upload Section */}
            {!analysis.data && !analysis.isLoading && (
              <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <ImageUpload 
                  onImageSelected={handleImageSelect} 
                  title="Arraste sua imagem ou clique para explorar"
                  icon="fa-cloud-arrow-up"
                />
              </div>
            )}

            {/* Loading State */}
            {analysis.isLoading && (
              <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-brand-600 text-2xl">
                     <i className="fa-solid fa-eye"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mt-8 font-display">Processando Imagem</h3>
                <p className="text-slate-500 mt-2 text-sm">Identificando materiais, dimensões e geometria...</p>
              </div>
            )}

            {/* Error State */}
            {analysis.error && (
              <div className="max-w-xl mx-auto mt-8">
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-4 shadow-sm">
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <h4 className="text-red-900 font-bold text-sm uppercase">Falha na Análise</h4>
                    <p className="text-red-700 text-sm mt-1">{analysis.error}</p>
                    <button 
                      onClick={resetApp}
                      className="mt-3 text-xs font-bold text-red-700 hover:text-red-900 hover:underline"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {analysis.data && (
              <div className="animate-fade-in-up">
                <div className="mb-8 no-print flex justify-between items-center">
                  <button 
                    onClick={resetApp}
                    className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-brand-300 shadow-sm"
                  >
                    <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Nova Análise
                  </button>
                </div>
                <ReportView 
                  data={analysis.data} 
                  imageSrc={imagePreview} 
                />
              </div>
            )}
          </div>
        )}

        {/* --- OUTRAS ABAS --- */}
        <div className="animate-fade-in">
          {activeTab === 'mockup' && <MockupGenerator />}
          {activeTab === 'compliance' && <ComplianceChecker />}
          {activeTab === 'formula' && <FormulaAnalyzer />}
          {activeTab === 'formulation' && <FormulationAssistant />}
          {activeTab === 'nutritable' && <NutritionalTableTool />}
          {activeTab === 'settings' && <Settings />}
        </div>

      </main>
    </div>
  );
};

export default App;
