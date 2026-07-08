import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import './Chatbot.css';
import { apiFetch } from './api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { rol: 'asistente', texto: '¡Hola! Soy tu asistente virtual de Trin.pe 🇵🇪. ¿En qué trámite te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { rol: 'usuario', texto: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          mensaje: userMessage.texto,
          historial: messages.filter(m => m.rol !== 'asistente' || m.texto !== '¡Hola! Soy tu asistente virtual de Trin.pe 🇵🇪. ¿En qué trámite te puedo ayudar hoy?')
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { rol: 'asistente', texto: data.respuesta }]);
      } else {
        setMessages(prev => [...prev, { rol: 'asistente', texto: 'Lo siento, tuve un problema de conexión. ¿Podrías intentar de nuevo?' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { rol: 'asistente', texto: 'Uy, parece que no puedo conectarme al servidor en este momento. Intenta más tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-fab" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3>Asistente Trin.pe</h3>
                <span className="chatbot-status">En línea</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble-wrapper ${msg.rol === 'usuario' ? 'right' : 'left'}`}>
                {msg.rol === 'asistente' && (
                  <div className="bubble-icon model"><Bot size={16} /></div>
                )}
                <div className={`chat-bubble ${msg.rol}`}>
                  <p>{msg.texto}</p>
                </div>
                {msg.rol === 'usuario' && (
                  <div className="bubble-icon user"><User size={16} /></div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble-wrapper left">
                <div className="bubble-icon model"><Bot size={16} /></div>
                <div className="chat-bubble asistente typing">
                  <Loader2 size={18} className="spin" /> Escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={enviarMensaje}>
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
