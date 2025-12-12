
import React, { useState, useEffect } from 'react';

// Funções auxiliares para manipulação de cores Hex
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Gera uma cor mais clara ou mais escura
const adjustBrightness = (hex: string, percent: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let r = rgb.r + percent;
  let g = rgb.g + percent;
  let b = rgb.b + percent;

  r = r < 0 ? 0 : r > 255 ? 255 : r;
  g = g < 0 ? 0 : g > 255 ? 255 : g;
  b = b < 0 ? 0 : b > 255 ? 255 : b;

  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
};

const Settings: React.FC = () => {
  const [brandColor, setBrandColor] = useState('#4f46e5'); // Default Indigo-600
  const [accentColor, setAccentColor] = useState('#0d9488'); // Default Teal-600
  const [bgColor, setBgColor] = useState('#f8fafc'); // Default Slate-50
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Carregar do localStorage ao montar
    const savedBrand = localStorage.getItem('theme-brand') || '#4f46e5';
    const savedAccent = localStorage.getItem('theme-accent') || '#0d9488';
    const savedBg = localStorage.getItem('theme-bg') || '#f8fafc';
    
    setBrandColor(savedBrand);
    setAccentColor(savedAccent);
    setBgColor(savedBg);
  }, []);

  const applyTheme = (brand: string, accent: string, bg: string) => {
    const root = document.documentElement;

    // Background
    root.style.setProperty('--color-bg-main', bg);

    // Accent
    root.style.setProperty('--color-accent-600', accent);
    root.style.setProperty('--color-accent-500', adjustBrightness(accent, 20));

    // Brand Scale (Gerar paleta monocromática básica)
    // Estamos aproximando os saltos de luminosidade do Tailwind
    root.style.setProperty('--color-brand-900', adjustBrightness(brand, -60));
    root.style.setProperty('--color-brand-800', adjustBrightness(brand, -40));
    root.style.setProperty('--color-brand-700', adjustBrightness(brand, -20));
    root.style.setProperty('--color-brand-600', brand); // Base
    root.style.setProperty('--color-brand-500', adjustBrightness(brand, 20));
    root.style.setProperty('--color-brand-400', adjustBrightness(brand, 40));
    root.style.setProperty('--color-brand-300', adjustBrightness(brand, 60));
    root.style.setProperty('--color-brand-200', adjustBrightness(brand, 120));
    root.style.setProperty('--color-brand-100', adjustBrightness(brand, 160));
    root.style.setProperty('--color-brand-50', adjustBrightness(brand, 190));
  };

  const handleSave = () => {
    applyTheme(brandColor, accentColor, bgColor);
    localStorage.setItem('theme-brand', brandColor);
    localStorage.setItem('theme-accent', accentColor);
    localStorage.setItem('theme-bg', bgColor);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    const defBrand = '#4f46e5';
    const defAccent = '#0d9488';
    const defBg = '#f8fafc';
    
    setBrandColor(defBrand);
    setAccentColor(defAccent);
    setBgColor(defBg);
    applyTheme(defBrand, defAccent, defBg);
    
    localStorage.removeItem('theme-brand');
    localStorage.removeItem('theme-accent');
    localStorage.removeItem('theme-bg');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-extrabold text-slate-900 mb-4">Configurações do Sistema</h1>
        <p className="text-lg text-slate-600 font-light">Personalize a aparência da plataforma e visualize informações da licença.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: PERSONALIZAÇÃO VISUAL */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-paintbrush text-brand-600"></i> Paleta de Cores
          </h2>

          <div className="space-y-6">
            {/* Cor Principal */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Cor Principal (Marca)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 shadow-sm"
                />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-mono mb-1">{brandColor}</p>
                  <p className="text-xs text-slate-500">Define botões, cabeçalhos e destaques principais.</p>
                </div>
              </div>
            </div>

            {/* Cor de Destaque */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Cor de Destaque (Secundária)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 shadow-sm"
                />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-mono mb-1">{accentColor}</p>
                  <p className="text-xs text-slate-500">Usada em ícones especiais e detalhes secundários.</p>
                </div>
              </div>
            </div>

            {/* Cor de Fundo */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Cor de Fundo da Página</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 shadow-sm border border-slate-200"
                />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-mono mb-1">{bgColor}</p>
                  <p className="text-xs text-slate-500">Recomendado tons claros (off-white, cinza gelo) para melhor leitura.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
             <button 
                onClick={handleSave}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                {isSaved ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>}
                {isSaved ? "Aplicado!" : "Salvar Tema"}
             </button>
             <button 
                onClick={handleReset}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                title="Restaurar Padrão"
             >
                <i className="fa-solid fa-rotate-left"></i>
             </button>
          </div>
        </div>

        {/* COLUNA 2: SOBRE O SISTEMA */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col justify-between">
           <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-slate-500"></i> Sobre o Sistema
              </h2>

              <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 mb-6">
                 <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1">Versão Atual</p>
                 <p className="text-3xl font-display font-extrabold text-brand-900">v2.0 <span className="text-sm font-medium text-brand-600 bg-white px-2 py-0.5 rounded-full ml-2 border border-brand-200">Stable Release</span></p>
                 <p className="text-xs text-brand-700/70 mt-2">Build: 2025.05.15_RC2</p>
              </div>

              <div className="space-y-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Licenciado Para</p>
                    <p className="text-sm font-bold text-slate-800">Uso Corporativo / P&D</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Módulos Ativos</p>
                    <div className="flex flex-wrap gap-2">
                       <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">VisionAnalyst</span>
                       <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">Formulado 3.0</span>
                       <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">Compliance ANVISA</span>
                       <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">Química</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Desenvolvido Por</p>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-md">
                    <i className="fa-solid fa-user-shield"></i>
                 </div>
                 <div>
                    <p className="text-base font-bold text-slate-900">Lucas Soares Coutinho</p>
                    <p className="text-xs text-slate-500 font-medium">Profissional da Segurança da Informação</p>
                    <p className="text-xs text-brand-600 font-medium">Especializado em Tecnologia de Alimentos</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
