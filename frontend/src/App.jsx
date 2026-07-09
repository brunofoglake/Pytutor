import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Caminho fixo do webhook dentro do n8n (isso não muda)
const WEBHOOK_PATH = "/webhook/chat-python";
const STORAGE_KEY = "python_tutor_backend_url";

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
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "http://localhost:5678"
  );
  const [backendUrlDraft, setBackendUrlDraft] = useState(backendUrl);
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
      const cleanUrl = backendUrl.trim().replace(/\/+$/, "");
      const response = await axios.post(`${cleanUrl}${WEBHOOK_PATH}`, {
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
          text: "Ops, houve um erro ao me comunicar com o servidor. Verifique se o n8n está rodando.",
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
        <button
          className="settings-button"
          onClick={() => {
            setBackendUrlDraft(backendUrl);
            setShowSettings((prev) => !prev);
          }}
          title="Configurar endereço do backend"
        >
          ⚙️
        </button>
        <h1>🐍 Python Tutor Bot</h1>
        <p>Aprenda Python conversando</p>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <label htmlFor="backend-url">Endereço do backend (n8n)</label>
          <input
            id="backend-url"
            type="text"
            value={backendUrlDraft}
            onChange={(e) => setBackendUrlDraft(e.target.value)}
            placeholder="http://localhost:5678 ou https://xxxx.trycloudflare.com"
          />
          <div className="settings-panel-actions">
            <button
              onClick={() => {
                const cleaned = backendUrlDraft.trim().replace(/\/+$/, "");
                setBackendUrl(cleaned);
                localStorage.setItem(STORAGE_KEY, cleaned);
                setShowSettings(false);
              }}
            >
              Salvar
            </button>
            <button className="secondary" onClick={() => setShowSettings(false)}>
              Cancelar
            </button>
          </div>
          <p className="settings-hint">
            Cole aqui a URL do túnel Cloudflare (ex: https://algo.trycloudflare.com) ou
            deixe como localhost se for testar na mesma máquina do backend.
          </p>
        </div>
      )}

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