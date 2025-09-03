import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { useUser } from '@clerk/clerk-react';

export default function TaxAssistant() {
    const { user } = useUser();
    const {
        chatHistory,
        askTaxAssistant,
        isAssistantLoading,
    } = useAppStore();

    const [userInput, setUserInput] = useState('');
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom of the chat container when new messages are added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userInput.trim() || isAssistantLoading) return;
        askTaxAssistant(userInput);
        setUserInput('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[60vh]">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    Your Tax Assistant
                </h2>
                <p className="text-sm text-gray-600 mt-1">Ask me anything about your finances</p>
            </div>

            <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
                {chatHistory.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                🤖
                            </div>
                        )}
                        <div className={`p-3 rounded-lg max-w-lg ${
                            message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: message.parts[0].text.replace(/\n/g, '<br />') }} />
                        </div>
                         {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                {user?.firstName?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                ))}
                {isAssistantLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            🤖
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., How much can I save with 80C?"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={isAssistantLoading}
                    />
                    <button
                        type="submit"
                        disabled={isAssistantLoading || !userInput.trim()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
