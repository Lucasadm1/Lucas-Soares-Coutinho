import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageSelected: (file: File, notes: string) => void;
  disabled?: boolean;
  title?: string;
  showNotes?: boolean;
  icon?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelected, 
  disabled, 
  title = "Clique para enviar ou arraste a imagem aqui",
  showNotes = true,
  icon = "fa-cloud-arrow-up"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0], userNotes);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0], userNotes);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Área de Drag & Drop */}
      <div
        className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer group overflow-hidden
          ${dragActive 
            ? "border-brand-500 bg-brand-50 scale-[1.02]" 
            : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 hover:shadow-md"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 z-10">
          <div className={`
             w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm
             ${dragActive 
               ? 'bg-brand-100 text-brand-600 scale-110' 
               : 'bg-white text-slate-400 group-hover:text-brand-500 group-hover:scale-110 group-hover:bg-brand-50'
             }
          `}>
            <i className={`fa-solid ${icon} text-3xl`}></i>
          </div>
          <p className="mb-2 text-base md:text-lg text-slate-700 font-bold font-display group-hover:text-brand-700 transition-colors">
            {title}
          </p>
          <p className="text-xs text-slate-400 group-hover:text-slate-500">
            Suporta PNG, JPG, WEBP de alta resolução
          </p>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Área de Texto para Contexto Adicional (Opcional) */}
      {showNotes && (
        <div className="mt-5">
          <label htmlFor="userNotes" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">
            Contexto Técnico (Opcional)
          </label>
          <div className="relative">
             <textarea
                id="userNotes"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-slate-700 placeholder-slate-400 bg-white resize-none shadow-sm transition-all hover:border-slate-300"
                rows={2}
                placeholder="Ex: Material, dimensões aproximadas, uso específico..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                disabled={disabled}
             />
             <div className="absolute bottom-3 right-3 text-slate-300 pointer-events-none">
                <i className="fa-solid fa-pen-to-square"></i>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;