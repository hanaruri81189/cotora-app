
import React from 'react';
import { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  chatInput: string;
  onChatInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => Promise<void>; // Make onSendMessage async
  isAiReplying: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatHistory,
  chatInput,
  onChatInputChange,
  onSendMessage,
  isAiReplying,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isAiReplying) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="mt-6 border-t border-rose-200 pt-6">
      <h4 className="text-lg font-semibold text-pink-700 mb-3">AIに修正を依頼する:</h4>
      <div className="chat-history bg-rose-50 p-4 rounded-lg h-64 overflow-y-auto mb-4 border border-rose-200">
        {chatHistory.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">修正したい点を具体的に指示してください。(例: もっと短くして、〇〇について追記して、など)</p>
        )}
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg max-w-[85%] ${
              msg.sender === 'user'
                ? 'bg-pink-100 text-pink-800 ml-auto text-right'
                : 'bg-gray-100 text-gray-800 mr-auto text-left'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-pink-600' : 'text-gray-500'}`}>
              {msg.sender === 'user' ? 'あなた' : 'AIアシスタント'} - {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        {isAiReplying && chatHistory.some(msg => msg.sender === 'user' && chatHistory.indexOf(msg) === chatHistory.length -1) && (
           <div className="mb-3 p-3 rounded-lg max-w-[85%] bg-gray-100 text-gray-800 mr-auto text-left flex items-center">
            <LoadingSpinner />
            <p className="text-sm ml-2">AIが応答を生成中です...</p>
          </div>
        )}
      </div>
      <div className="chat-input flex items-start space-x-2">
        <textarea
          value={chatInput}
          onChange={onChatInputChange}
          onKeyDown={handleKeyDown}
          placeholder="AIへの修正指示を入力 (Shift+Enterで改行)"
          rows={3}
          className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm resize-none"
          disabled={isAiReplying}
          aria-label="AIへの修正指示"
        />
        <button
          type="button"
          onClick={onSendMessage}
          disabled={isAiReplying || !chatInput.trim()}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed self-stretch flex items-center justify-center"
          aria-label="修正指示を送信する"
        >
          {isAiReplying ? <LoadingSpinner /> : '送信'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;