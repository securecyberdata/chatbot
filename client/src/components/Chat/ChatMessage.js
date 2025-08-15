import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Clock, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser 
              ? 'bg-gradient-to-r from-neon-blue to-neon-purple' 
              : 'bg-gradient-to-r from-neon-green to-neon-blue'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
            <div className={`inline-block px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                : 'bg-dark-800 border border-dark-600 text-white'
            }`}>
              {isAssistant ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-invert max-w-none"
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({ children, className }) => (
                      <code className={`${className} bg-dark-700 px-2 py-1 rounded text-neon-green`}>
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-dark-700 p-3 rounded-lg overflow-x-auto mb-2">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-neon-blue pl-4 italic text-dark-300 mb-2">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-neon-blue hover:text-neon-purple underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {/* Message Metadata */}
            <div className={`flex items-center space-x-2 mt-2 text-xs text-dark-400 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(message.timestamp)}</span>
              </div>

              {isAssistant && message.metadata?.model && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>{message.metadata.model}</span>
                </div>
              )}

              {isAssistant && message.metadata?.tokens && (
                <span className="text-neon-green">
                  {message.metadata.tokens} tokens
                </span>
              )}

              {isAssistant && message.metadata?.processingTime && (
                <span className="text-neon-yellow">
                  {message.metadata.processingTime}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
