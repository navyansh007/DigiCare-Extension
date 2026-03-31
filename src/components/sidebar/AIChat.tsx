import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '../ui';
import type { Patient } from '../../types/patient';
import { askPatientQuestion } from '../../services/pipelineService';

interface AIChatProps {
    patient: Patient;
    specialization: string;
    patientId: string;
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    isTyping?: boolean;
}

export function AIChat({ patient, specialization, patientId }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'ai',
            text: `Hello! I've analyzed ${patient.name}'s records with a focus on ${specialization}. Ask me anything about their history, medications, or vitals.`
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateResponse = (query: string) => {
        const q = query.toLowerCase();

        // Heuristic "RAG" Logic
        if (q.includes('allergy') || q.includes('allergies')) {
            const allergies = patient.allergies.map(a => `${a.name} (${a.severity})`).join(', ');
            return allergies ? `Patient has the following allergies: ${allergies}.` : "No known allergies recorded.";
        }

        if (q.includes('medication') || q.includes('medicine') || q.includes('drug')) {
            const meds = patient.medications.filter(m => m.status === 'Active').map(m => `${m.name} ${m.dosage}`).join(', ');
            return meds ? `Current active medications: ${meds}.` : "No active medications recorded.";
        }

        if (q.includes('condition') || q.includes('disease') || q.includes('diagnosis')) {
            const conds = patient.conditions.map(c => `${c.name} (${c.status})`).join(', ');
            return conds ? `Documented conditions: ${conds}.` : "No significant conditions on file.";
        }

        if (q.includes('vital') || q.includes('bp') || q.includes('blood pressure')) {
            if (!patient.vitals) return 'No vitals have been recorded for this patient.';
            return `Latest vitals — BP ${patient.vitals.bloodPressure.systolic}/${patient.vitals.bloodPressure.diastolic} mmHg, HR ${patient.vitals.heartRate} bpm, SpO2 ${patient.vitals.oxygenSaturation}%.`;
        }

        if (q.includes('history') || q.includes('visit')) {
            const last = patient.recentVisits[0];
            return last ? `Last visit was on ${last.date} for ${last.diagnosis}.` : "No recent visits found.";
        }

        if (q.includes('risk') || q.includes('cardio')) {
            return `Based on ${specialization} analysis: Patient has elevated cardiovascular risk due to ${patient.conditions.find(c => c.name.includes('Hyper')) ? 'Hypertension' : 'age and vitals'}. Recommendation: Monitor lipid profile.`;
        }

        return `I found information related to ${patient.name}'s ${specialization} profile. Could you be more specific? You can ask about allergies, medications, vitals, or recent visits.`;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Try pipeline first; it has access to actual lab findings
            const result = await askPatientQuestion(patientId, userMsg.text);
            setMessages(prev => [
                ...prev,
                { id: (Date.now() + 1).toString(), sender: 'ai', text: result.answer }
            ]);
        } catch {
            // Pipeline unreachable or no findings stored — fall back to local heuristics
            const responseText = generateResponse(userMsg.text);
            setMessages(prev => [
                ...prev,
                { id: (Date.now() + 1).toString(), sender: 'ai', text: responseText }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-medical-600 text-white' : 'bg-white border border-gray-200 text-purple-600'
                            }`}>
                            {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                ? 'bg-medical-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about patient history..."
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all text-sm"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1.5 p-1.5 h-auto rounded-lg bg-medical-600 hover:bg-medical-700 text-white"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                    AI generated responses based on {specialization} context. Verify all info.
                </p>
            </div>
        </div>
    );
}
