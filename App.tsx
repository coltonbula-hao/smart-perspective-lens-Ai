
import React, { useState } from 'react';
import { AnalysisStatus, AnalysisResponse } from './types';
import { analyzeIntelligence } from './services/geminiService';
import { AnalysisResult } from './components/AnalysisResult';
import { FileText, Upload, BrainCircuit, Search, X, Loader2, Sparkles, AlertCircle, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [textInput, setTextInput] = useState('');
  const [fileData, setFileData] = useState<{ data: string; mimeType: string } | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatus(AnalysisStatus.UPLOADING);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];
        setFileData({ data: base64Data, mimeType: file.type });
        setStatus(AnalysisStatus.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!textInput && !fileData) return;
    
    setError(null);
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const result = await analyzeIntelligence(fileData || textInput, useWebSearch);
      setAnalysisResult(result);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '分析过程中发生错误，请稍后重试。');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setTextInput('');
    setFileData(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">智能透视镜 <span className="text-indigo-600">BI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-slate-500 text-xs font-medium uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-500" />
              由 Gemini 3 Flash 驱动
            </div>
            {status === AnalysisStatus.COMPLETED && (
              <button 
                onClick={reset}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                重新分析
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10">
        {status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR || status === AnalysisStatus.UPLOADING ? (
          <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4 leading-tight">
                秒级深度 <br />商业情报分析
              </h2>
              <p className="text-slate-500 text-lg">
                上传财报、研报、输入公司名或粘贴新闻链接，自动提取核心指标并联网搜索最新背景。
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700">粘贴研报、新闻或公司名</label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={useWebSearch} 
                        onChange={() => setUseWebSearch(!useWebSearch)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${useWebSearch ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useWebSearch ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      联网搜索
                    </span>
                  </label>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="在此输入公司名称（如：英伟达）、粘贴长文本或业绩电话会议纪要..."
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-slate-600 transition-all outline-none"
                  disabled={!!fileData}
                />
              </div>

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">或者</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">上传 PDF / TXT 报告</label>
                {!fileData ? (
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">点击上传或将文件拖拽至此</p>
                      <p className="text-xs text-slate-400 mt-1">支持 PDF, TXT (最大 20MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-900">文档已成功解析</span>
                    </div>
                    <button onClick={() => setFileData(null)} className="p-1 hover:bg-white rounded-full transition-colors">
                      <X className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                disabled={(!textInput && !fileData) || status === AnalysisStatus.UPLOADING}
                onClick={runAnalysis}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {status === AnalysisStatus.UPLOADING ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在读取文件...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    立即运行智能分析
                  </>
                )}
              </button>
            </div>

            {/* Workflow steps */}
            <div className="grid grid-cols-3 gap-4 pt-10">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-xs font-bold">1</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">核心数据提取</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xs font-bold">2</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SWOT & 风险透视</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xs font-bold">3</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">投资决策建议</p>
              </div>
            </div>
          </div>
        ) : status === AnalysisStatus.ANALYZING ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-full shadow-2xl border border-slate-100">
                <BrainCircuit className="w-16 h-16 text-indigo-600 animate-bounce" />
              </div>
            </div>
            <div className="text-center max-w-sm space-y-2">
              <h3 className="text-2xl font-black text-slate-900">正在进行深度透视...</h3>
              <p className="text-slate-400 text-sm">
                Gemini 正在提取财务指标、{useWebSearch && "联网搜索最新背景、"}解码管理层表态并扫描隐形风险。
              </p>
              <div className="pt-6">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-1/2 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          analysisResult && <AnalysisResult data={analysisResult} />
        )}
      </main>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default App;
