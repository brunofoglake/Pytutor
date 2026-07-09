import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Troque pela sua URL fixa do ngrok (ex: https://seu-dominio.ngrok-free.app)
const WEBHOOK_URL = "https://SEU-DOMINIO.ngrok-free.app/webhook/chat-python";

// Gera um ID de sessão único por aba/navegador, mantido enquanto a página não recarrega
const sessionId = crypto.randomUUID();

function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Olá! Sou seu professor de Python. Pergunte sobre alguma função, cole um trecho de código, ou tire uma dúvida geral!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(WEBHOOK_URL, {
        message: trimmed,
        sessionId,
      });

      const botReply = response.data.reply || "Desculpe, não consegui gerar uma resposta.";
      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (error) {
      console.error("Erro ao chamar o webhook:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Ops, houve um erro ao me comunicar com o servidor. Verifique se o backend está rodando.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>🐍 Python Tutor Bot</h1>
        <p>Aprenda Python conversando</p>
      </header>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-bubble loading">Pensando...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre Python ou cole um trecho de código..."
          rows={2}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}

export default App;