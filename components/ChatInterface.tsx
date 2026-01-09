import React, { useState, useRef, useEffect } from 'react';
import { Subject, Message, SubjectConfig, StudyMode, Slide } from '../types';
import { streamChatResponse, generatePresentationContent, generateImage } from '../services/gemini';
import MarkdownRenderer from './MarkdownRenderer';
import { ArrowRight, Send, RefreshCw, StopCircle, FileText, Download, Mail, Image as ImageIcon, Loader2 } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ChatInterfaceProps {
  subject: SubjectConfig;
  mode: StudyMode;
  onBack: () => void;
}

const getWelcomeMessage = (subjectName: string, mode: StudyMode): string => {
  switch (mode) {
    case StudyMode.HOMEWORK:
      return `היי! בוא נתקתק את השיעורים ב${subjectName}. איזו שאלה תוקעת אותך? 📝`;
    case StudyMode.QUIZ:
      return `יאללה מבחן! ✍️ אני מוכן לבחון אותך ב${subjectName}. באיזה נושא נתמקד?`;
    case StudyMode.PRESENTATION:
      return `מצגת ב${subjectName}? מגניב! 📊
אתה יכול לדבר איתי כדי לתכנן רעיונות, או ללחוץ על הכפתור למטה כדי שאני אבנה לך ממש קובץ PDF מוכן עם תמונות לכל שקופית!
מה הנושא של המצגת?`;
    case StudyMode.CASUAL:
    default:
      return `אהלן! 👋 אני ספארקי. על מה בא לך לדבר בהקשר של ${subjectName}?`;
  }
};

// Helper to draw wrapped text on canvas
const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const lines = text.split('\n');
  let currentY = y;

  for (const line of lines) {
     const words = line.split(' ');
     let currentLine = '';

     for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
           ctx.fillText(currentLine, x, currentY);
           currentLine = words[n] + ' ';
           currentY += lineHeight;
        } else {
           currentLine = testLine;
        }
     }
     ctx.fillText(currentLine, x, currentY);
     currentY += lineHeight * 1.5; // Extra space between bullet points
  }
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ subject, mode, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: getWelcomeMessage(subject.name, mode),
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Presentation Generation States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (!isGeneratingPdf) {
      inputRef.current?.focus();
    }
  }, [messages, isTyping, isGeneratingPdf, generationStep]);

  // --- Slide Rendering Logic (Canvas) ---
  const createSlideImage = async (slide: Slide, imageBase64: string | undefined, isCover: boolean): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        // A4 aspect ratio approx 297x210, let's use high res
        const WIDTH = 1200;
        const HEIGHT = 848; // ~ A4 Landscape ratio
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Header Decoration
        const subjectColor = subject.color === 'blue' ? '#3b82f6' : 
                             subject.color === 'green' ? '#22c55e' : 
                             subject.color === 'amber' ? '#f59e0b' : 
                             subject.color === 'rose' ? '#f43f5e' : 
                             subject.color === 'violet' ? '#8b5cf6' : '#06b6d4';
        
        ctx.fillStyle = subjectColor;
        ctx.fillRect(0, 0, WIDTH, 20); // Top bar
        ctx.fillRect(0, HEIGHT - 10, WIDTH, 10); // Bottom bar

        // Setup Font
        // Note: System fonts usually support Hebrew. 
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        if (isCover) {
            // COVER LAYOUT
            ctx.fillStyle = subjectColor + '10'; // Very light bg tint
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fillStyle = subjectColor;
            ctx.fillRect(0, 0, WIDTH, 20);
            
            // Title
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 70px sans-serif';
            ctx.fillText(slide.title, WIDTH - 50, 100);

            // Image (Centered)
            if (imageBase64) {
               const img = new Image();
               img.onload = () => {
                   const imgWidth = 800;
                   const imgHeight = 450;
                   ctx.drawImage(img, (WIDTH - imgWidth) / 2, 220, imgWidth, imgHeight);
                   
                   // Footer Text
                   ctx.font = '30px sans-serif';
                   ctx.textAlign = 'center';
                   ctx.fillStyle = '#64748b';
                   ctx.fillText("נוצר על ידי ספארקי - המורה הפרטי שלך", WIDTH / 2, HEIGHT - 60);
                   
                   resolve(canvas.toDataURL('image/jpeg', 0.8));
               };
               img.src = `data:image/png;base64,${imageBase64}`;
            } else {
               resolve(canvas.toDataURL('image/jpeg', 0.8));
            }
        } else {
            // CONTENT SLIDE LAYOUT
            // Title
            ctx.fillStyle = subjectColor;
            ctx.font = 'bold 50px sans-serif';
            ctx.fillText(slide.title, WIDTH - 40, 60);

            // Divider
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(40, 130, WIDTH - 80, 2);

            // Layout: Image Left, Text Right
            const contentX = WIDTH - 40;
            const contentY = 160;
            const contentWidth = 600;

            // Draw Text
            ctx.fillStyle = '#334155';
            ctx.font = '32px sans-serif';
            wrapText(ctx, slide.content, contentX, contentY, contentWidth, 45);

            // Draw Image
            if (imageBase64) {
                const img = new Image();
                img.onload = () => {
                    // Image box on left
                    const imgX = 40;
                    const imgY = 160;
                    const imgW = 450;
                    const imgH = 340;
                    
                    // Draw nice border/shadow for image
                    ctx.fillStyle = '#f1f5f9';
                    ctx.fillRect(imgX - 10, imgY - 10, imgW + 20, imgH + 20);
                    
                    ctx.drawImage(img, imgX, imgY, imgW, imgH);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = `data:image/png;base64,${imageBase64}`;
            } else {
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            }
        }
    });
  };

  // --- PDF Generation Logic ---
  const handleGeneratePDF = async () => {
    const topic = inputValue.trim();
    if (!topic) {
       alert("בבקשה כתוב את נושא המצגת בשורת הטקסט למטה ואז לחץ על הכפתור");
       return;
    }

    setIsGeneratingPdf(true);
    setPdfUrl(null);
    setInputValue(''); 

    try {
      // Step 1: Generate Content
      setGenerationStep('בונה את סיפור המצגת...');
      const slides = await generatePresentationContent(topic, subject.id);

      // Step 2: Generate Images (Parallel)
      setGenerationStep(`מצייר ${slides.length} תמונות ייחודיות לשקופיות... (זה ייקח בערך דקה)`);
      
      const imagePromises = slides.map(slide => generateImage(slide.imagePrompt));
      const images = await Promise.all(imagePromises);

      // Step 3: Render Slides to Canvas & Add to PDF
      setGenerationStep('מרכיב את קובץ ה-PDF...');
      
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < slides.length; i++) {
          if (i > 0) doc.addPage();
          
          const slideImage = await createSlideImage(slides[i], images[i], i === 0);
          doc.addImage(slideImage, 'JPEG', 0, 0, 297, 210);
      }

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setGenerationStep('הכל מוכן! 🎉');

    } catch (error) {
      console.error(error);
      setGenerationStep('אוי, משהו השתבש ביצירת המצגת. נסה שוב.');
      setTimeout(() => setIsGeneratingPdf(false), 4000);
    }
  };

  const handleDownload = () => {
     if (pdfUrl) {
         const a = document.createElement('a');
         a.href = pdfUrl;
         a.download = `Sparky_Presentation_${Date.now()}.pdf`;
         a.click();
     }
  };

  const handleEmail = () => {
      const subjectText = "המצגת שלי מספארקי";
      const bodyText = "היי,\n\nמצורפת המצגת שהכנתי בעזרת ספארקי.\n\n(אל תשכח לצרף את קובץ ה-PDF שהורדת!)";
      window.open(`mailto:?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`);
      handleDownload();
      alert("הורדנו את ה-PDF למחשב שלך.\nהחלון של האימייל נפתח - אל תשכח לגרור או לצרף את הקובץ להודעה!");
  };

  const handleClosePdf = () => {
      setIsGeneratingPdf(false);
      setPdfUrl(null);
  };

  // --- Standard Chat Logic ---
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    let fullResponse = "";
    const responseId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, {
        id: responseId,
        role: 'model',
        content: '',
        timestamp: Date.now()
    }]);

    try {
      const historyForApi = messages.filter(m => m.content.length > 0);
      historyForApi.push(userMsg);

      const stream = streamChatResponse(historyForApi, userMsg.content, subject.id, mode);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === responseId 
            ? { ...msg, content: fullResponse } 
            : msg
        ));
      }
    } catch (error) {
      console.error("Streaming error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- RENDER ---

  if (isGeneratingPdf) {
      return (
          <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6 text-center animate-fadeIn relative">
              <button onClick={handleClosePdf} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
                  ✖
              </button>

              {!pdfUrl ? (
                  // Loading State
                  <div className="space-y-6">
                      <div className={`w-20 h-20 rounded-full bg-${subject.color}-100 flex items-center justify-center mx-auto animate-bounce`}>
                          <Loader2 className={`w-10 h-10 text-${subject.color}-500 animate-spin`} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">{generationStep}</h3>
                      <p className="text-slate-500">ה-AI עובד קשה על המצגת שלך... זה יכול לקחת דקה.</p>
                  </div>
              ) : (
                  // Success State
                  <div className="space-y-6 w-full max-w-2xl animate-fadeIn">
                      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
                           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                               <FileText className="w-8 h-8" />
                           </div>
                           <h3 className="text-2xl font-bold text-slate-800 mb-2">המצגת מוכנה! 🎉</h3>
                           <p className="text-slate-500 mb-6">יצרתי עבורך קובץ PDF עם {subject.name} ותמונות ייחודיות לכל שקופית.</p>
                      
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                              <button 
                                  onClick={handleDownload}
                                  className="flex items-center justify-center gap-2 bg-slate-800 text-white p-4 rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
                              >
                                  <Download className="w-5 h-5" />
                                  הורד קובץ PDF
                              </button>
                              
                              <button 
                                  onClick={handleEmail}
                                  className="flex items-center justify-center gap-2 bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                              >
                                  <Mail className="w-5 h-5" />
                                  שלח לאימייל
                              </button>
                          </div>
                      </div>
                      <p className="text-sm text-slate-400">
                          שים לב: בשליחה לאימייל, עליך לצרף ידנית את הקובץ שהורדת.
                      </p>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-${subject.color}-400 to-${subject.color}-600 text-white shadow-md`}>
                {subject.icon}
             </div>
             <div>
               <h2 className="font-bold text-lg leading-none text-slate-800">{subject.name}</h2>
               <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                 {mode === StudyMode.HOMEWORK ? 'שיעורי בית' : mode === StudyMode.QUIZ ? 'מבחן' : mode === StudyMode.PRESENTATION ? 'מצגת' : 'שיחה'}
               </span>
             </div>
          </div>
        </div>
        <button 
            onClick={() => {
                setMessages([{
                    id: 'welcome-reset',
                    role: 'model',
                    content: getWelcomeMessage(subject.name, mode),
                    timestamp: Date.now()
                }]);
            }}
            className="text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1"
        >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">התחל מחדש</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm text-sm md:text-base
                  ${isUser ? 'bg-indigo-100 text-indigo-600' : `bg-gradient-to-br from-${subject.color}-400 to-${subject.color}-600 text-white`}
                `}>
                  {isUser ? 'אני' : 'AI'}
                </div>

                <div className={`
                  p-4 rounded-2xl shadow-sm text-slate-800
                  ${isUser 
                    ? 'bg-white rounded-tl-none border border-indigo-50' 
                    : 'bg-white rounded-tr-none border-r-4 border-r-' + subject.color + '-400'
                  }
                `}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && messages[messages.length - 1].role === 'user' && (
           <div className="flex w-full justify-start">
             <div className="flex max-w-[70%] gap-3">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-${subject.color}-400 to-${subject.color}-600 text-white shadow-sm`}>
                  AI
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm flex gap-1 items-center h-12">
                   <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-10">
        
        {mode === StudyMode.PRESENTATION && (
            <div className="max-w-4xl mx-auto mb-2 flex justify-end">
                <button
                    onClick={handleGeneratePDF}
                    disabled={isTyping || !inputValue.trim()}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm
                        ${!inputValue.trim() 
                            ? 'bg-orange-100 text-orange-300 cursor-not-allowed' 
                            : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md'
                        }
                    `}
                >
                    <FileText className="w-4 h-4" />
                    צור מצגת PDF עם תמונות (בנושא שכתבת)
                </button>
            </div>
        )}

        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
            <div className="relative flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === StudyMode.PRESENTATION ? "כתוב כאן את נושא המצגת..." : "..."}
                    disabled={isTyping}
                    className="w-full pr-5 pl-12 py-4 rounded-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                />
            </div>
            
            <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-md
                    ${!inputValue.trim() || isTyping 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-indigo-600'
                    }
                `}
            >
                {isTyping ? <StopCircle className="w-6 h-6" /> : <Send className="w-6 h-6 ml-1 transform rotate-180" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;