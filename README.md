# 🐍 Pytutor

Um chatbot educacional que ensina **Python para iniciantes**, construído com **n8n** (orquestração/backend), **Ollama** (modelo de linguagem open source rodando localmente) e **React** (interface web).

Repositório: [github.com/brunofoglake/Pytutor](https://github.com/brunofoglake/Pytutor)

O bot foi desenhado para três tipos de interação:
- **Perguntas sobre funções/conceitos** (ex: "o que é uma lista?") → explica o conceito, mostra a sintaxe e dá um exemplo curto.
- **Trechos de código colados pelo usuário** (ex: um `for` com `print`) → explica o objetivo geral e depois linha por linha, em linguagem simples.
- **Perguntas gerais sobre Python** → resposta direta e objetiva.

> Este projeto foi construído como estudo prático de automação com IA (n8n + LLM open source) integrada a uma aplicação web real, sem depender de nenhuma API paga.

---

## Índice

1. [Arquitetura](#arquitetura)
2. [Stack utilizada](#stack-utilizada)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Pré-requisitos](#pré-requisitos)
5. [Guia de instalação (Windows)](#guia-de-instalação-windows)
6. [Configurando o backend (n8n + Ollama)](#configurando-o-backend-n8n--ollama)
7. [Expondo o backend com ngrok](#expondo-o-backend-com-ngrok)
8. [Rodando o frontend](#rodando-o-frontend)
9. [Publicando o frontend (GitHub Pages)](#publicando-o-frontend-github-pages)
10. [Prompt de sistema utilizado](#prompt-de-sistema-utilizado)
11. [Problemas conhecidos e soluções](#problemas-conhecidos-e-soluções)
12. [Limitações do projeto](#limitações-do-projeto)
13. [Possíveis evoluções futuras](#possíveis-evoluções-futuras)

---

## Arquitetura

```
┌─────────────────────┐        HTTPS (ngrok)            ┌──────────────────────────┐
│   Frontend (React)  │ ─────────────────────────────▶ │   n8n (Docker, local)    │
│   Hospedado no      │                                │   Webhook → AI Agent     │
│   GitHub Pages      │ ◀────────────────────────────  │   → Respond to Webhook   │
└─────────────────────┘        JSON de resposta         └───────────┬──────────────┘
                                                                    │
                                                                    ▼
                                                        ┌──────────────────────┐
                                                        │  Ollama (Docker,     │
                                                        │  local) — Qwen2.5    │
                                                        └──────────────────────┘
```

**Decisão arquitetural importante:** o frontend fica hospedado publicamente (GitHub Pages), mas o backend (n8n + Ollama) roda **localmente**, na máquina de quem hospeda o projeto. Um túnel do **ngrok** expõe esse backend local através de uma URL HTTPS fixa, permitindo que o site hospedado converse com ele.

Isso significa que, para o chat funcionar de verdade, **o Docker (n8n + Ollama) e o ngrok precisam estar rodando** na máquina do host no momento em que alguém acessa o site. Essa decisão foi tomada conscientemente: manter tudo 100% self-hosted e gratuito (sem depender de APIs pagas ou de hospedagem paga para um modelo de IA) tem esse trade-off. Mais detalhes em [Limitações do projeto](#limitações-do-projeto).

---

## Stack utilizada

| Camada | Tecnologia | Papel |
|---|---|---|
| Frontend | React (Vite) + Axios + react-markdown | Interface de chat, envio de mensagens, renderização de markdown |
| Backend / Orquestração | n8n (self-hosted via Docker) | Recebe requisições via Webhook, gerencia o fluxo de IA e memória de conversa |
| Modelo de IA | Ollama rodando Qwen2.5 (3B ou 7B) | Geração das respostas, 100% local e open source |
| Túnel | ngrok (domínio fixo gratuito) | Expõe o backend local via HTTPS para o frontend hospedado |
| Hospedagem do frontend | GitHub Pages | Hospedagem estática gratuita |
| Containerização | Docker + Docker Compose | Orquestra n8n e Ollama juntos, com volumes persistentes |

---

## Estrutura de pastas

```
Pytutor/
├── .gitignore
├── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── App.jsx          # Componente principal do chat
│   │   ├── App.css          # Estilos
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
└── n8n/
    ├── docker-compose.yml    # Sobe n8n + Ollama
    ├── .env                  # Configuração local (NÃO versionado)
    └── .env.example          # Modelo do .env, para referência
```

> Repare que o `docker-compose.yml` fica dentro da pasta `n8n/`, não na raiz — então todos os comandos `docker compose` abaixo devem ser executados de dentro dessa pasta.

---

## Pré-requisitos

Antes de começar, tenha instalado:

- **Docker Desktop** (para rodar n8n e Ollama em containers)
- **Node.js** (versão 18 ou superior) e **npm**
- **Git**
- Uma conta gratuita no **[ngrok](https://ngrok.com)** (para expor o backend local)
- Uma conta no **GitHub** (para hospedar o frontend, opcional)

---

## Guia de instalação (Windows)

### 1. Instalar o Docker Desktop

1. Baixe em [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
2. Execute o instalador e siga o assistente (o Docker Desktop no Windows requer o **WSL 2**, que o próprio instalador ajuda a configurar caso não esteja habilitado).
3. Reinicie o computador se solicitado.
4. Abra o Docker Desktop e aguarde o ícone da baleia ficar estável na bandeja do sistema (indica que o serviço está rodando).
5. Confirme no PowerShell ou Prompt de Comando:
   ```powershell
   docker --version
   docker compose version
   ```

### 2. Instalar o Node.js

1. Baixe a versão **LTS** em [nodejs.org](https://nodejs.org/).
2. Execute o instalador (next, next, finish — as opções padrão servem).
3. Confirme:
   ```powershell
   node --version
   npm --version
   ```

### 3. Instalar o Git

1. Baixe em [git-scm.com](https://git-scm.com/download/win).
2. Instale com as opções padrão.

### 4. Clonar o repositório

```powershell
git clone https://github.com/brunofoglake/Pytutor.git
cd Pytutor
```

### 5. Criar o arquivo `.env`

Dentro da pasta `n8n/`, copie o modelo:
```powershell
cd n8n
copy .env.example .env
```

Isso garante que o Docker Compose sempre use o mesmo nome de projeto, evitando a criação de volumes duplicados caso a pasta seja renomeada no futuro.

---

## Configurando o backend (n8n + Ollama)

### 1. Subir os containers

De dentro da pasta `n8n/` (onde está o `docker-compose.yml`):
```powershell
docker compose up -d
```

Confirme que ambos os serviços subiram:
```powershell
docker compose ps
```
Deve mostrar `n8n` e `ollama` com status `running`/`Up`.

### 2. Baixar o modelo de IA

```powershell
docker exec -it ollama ollama pull qwen2.5:3b
```

> **Por que o 3B e não o 7B?** O modelo 7B produz respostas de melhor qualidade, mas em CPU (sem GPU dedicada) pode levar minutos para responder. O 3B é bem mais rápido, com qualidade ainda muito boa para o propósito educacional do bot. Se sua máquina tiver uma GPU potente ou você não se importar com a demora, pode usar `qwen2.5:7b` no lugar.

### 3. Montar o workflow no n8n

Acesse **http://localhost:5678** no navegador (na primeira vez, será solicitado criar um usuário local).

Crie um novo workflow com os seguintes nós, nesta ordem:

**a) Webhook**
- HTTP Method: `POST`
- Path: `chat-python`
- Respond: `Using 'Respond to Webhook' Node`
- Em Options → Allowed Origins (CORS): `*`

**b) AI Agent**
- Conecte um **Ollama Chat Model** no slot de Chat Model:
  - Credential: Base URL = `http://ollama:11434` (nome do serviço no Docker, não `localhost`)
  - Model: `qwen2.5:3b`
- Conecte um **Simple Memory** no slot de Memory:
  - Session ID Source: `Define below`
  - Session ID: `{{ $json.body.sessionId }}`
- No campo de prompt principal (User Message), fonte `Define below`:
  ```
  {{ $json.body.message }}
  ```
- Adicione o **System Message** (ver seção [Prompt de sistema utilizado](#prompt-de-sistema-utilizado) abaixo).

**c) Respond to Webhook**
- Respond With: `JSON`
- Response Body (em modo **Expression**):
  ```
  { reply: $json.output }
  ```

### 4. Publicar o workflow

No canto superior direito do editor, clique em **Publish** (ou ative o toggle de status do workflow, dependendo da versão do n8n). Isso ativa a **URL de produção** do webhook (sem precisar clicar em "Execute workflow" a cada teste):
```
http://localhost:5678/webhook/chat-python
```

---

## Expondo o backend com ngrok

Como o frontend fica hospedado publicamente (HTTPS) mas o backend roda em `localhost`, é necessário um túnel HTTPS para conectar os dois — navegadores bloqueiam automaticamente chamadas de páginas HTTPS para endereços HTTP puro (erro de "Mixed Content").

### 1. Instalar o ngrok

Baixe em [ngrok.com/download](https://ngrok.com/download) (versão Windows) e siga as instruções de instalação.

### 2. Criar conta e configurar o authtoken

1. Crie uma conta gratuita em [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup).
2. Copie seu authtoken em **Your Authtoken** no dashboard.
3. No terminal:
   ```powershell
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

### 3. Reservar um domínio fixo gratuito

No dashboard, vá em **Universal Edge → Domains** e reserve seu domínio gratuito (formato `algo.ngrok-free.dev` ou `algo.ngrok-free.app`, dependendo da conta).

### 4. Rodar o túnel

```powershell
ngrok http --url=SEU-DOMINIO.ngrok-free.dev 5678
```

Deixe esse terminal aberto enquanto o chat estiver em uso — essa URL fixa não muda entre reinícios.

---

## Rodando o frontend

### 1. Instalar dependências

De dentro da pasta `frontend/`:
```powershell
cd frontend
npm install
```

### 2. Configurar a URL do backend

Abra `frontend/src/App.jsx` e ajuste a constante no topo do arquivo:
```js
const WEBHOOK_URL = "https://SEU-DOMINIO.ngrok-free.dev/webhook/chat-python";
```

### 3. Rodar em modo desenvolvimento

```powershell
npm run dev
```

Acesse `http://localhost:5173` e teste o chat.

---

## Publicando o frontend (GitHub Pages)

### 1. Ajustar o `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Pytutor/',
})
```

### 2. Instalar a ferramenta de deploy

```powershell
npm install gh-pages --save-dev
```

### 3. Adicionar scripts no `package.json`

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

### 4. Publicar

```powershell
npm run deploy
```

### 5. Ativar o GitHub Pages

No repositório, vá em **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `gh-pages` e a pasta raiz. Em poucos minutos o site estará disponível em:
```
https://brunofoglake.github.io/Pytutor/
```

> **Lembrete:** para o chat funcionar de verdade nesse link, o Docker (n8n + Ollama) e o ngrok precisam estar rodando na máquina do host no momento do acesso.

---

## Prompt de sistema utilizado

Este é o prompt configurado no campo **System Message** do nó AI Agent, responsável por definir o comportamento pedagógico do bot:

```
Você é um professor de Python para iniciantes, paciente e didático.

IMPORTANTE: Responda SEMPRE e EXCLUSIVAMENTE em português do Brasil, do
início ao fim da resposta, nunca troque de idioma no meio do texto,
independente do que for perguntado.

Seu público-alvo nunca programou antes ou está começando agora. Siga estas regras:

1. QUANDO O USUÁRIO PERGUNTAR SOBRE UMA FUNÇÃO OU CONCEITO (ex: "o que é uma lista?", "para que serve o for?"):
   - Explique o que é/faz em 1-2 frases simples.
   - Mostre a sintaxe básica.
   - Dê um exemplo curto e prático (poucas linhas).
   - Evite jargão técnico sem explicar (se usar um termo técnico, explique-o na hora).

2. QUANDO O USUÁRIO COLAR UM TRECHO DE CÓDIGO e perguntar o que ele faz:
   - Explique o objetivo geral do código primeiro, em 1 frase.
   - Depois, explique linha por linha (ou bloco por bloco), em linguagem simples, como se estivesse ensinando alguém que nunca viu aquilo.
   - Não presuma conhecimento prévio de conceitos que não apareceram no código.

3. QUANDO A PERGUNTA FOR GERAL SOBRE PYTHON (ex: "por que Python é popular?", "qual a diferença entre lista e tupla?"):
   - Responda de forma clara e objetiva, com exemplos quando fizer sentido.

REGRAS GERAIS:
- Nunca presuma que o usuário sabe programação prévia em outra linguagem.
- Use exemplos de código sempre que possível, formatados em blocos de código.
- Seja encorajador e evite tom condescendente.
- Se a pergunta não tiver relação com Python ou programação, gentilmente redirecione o usuário de volta ao tema, sem ser rude.
- Mantenha as respostas objetivas — evite textos longos demais para perguntas simples.
```

---

## Problemas conhecidos e soluções

Durante o desenvolvimento, alguns problemas específicos surgiram e foram resolvidos — documentados aqui para referência futura:

| Problema | Causa | Solução |
|---|---|---|
| `No session ID found` no nó Simple Memory | O nó Webhook (diferente do Chat Trigger) não gera `sessionId` automaticamente | Configurar Session ID Source como "Define below" e usar `{{ $json.body.sessionId }}` |
| `Invalid JSON in Response Body` | Misturar modo Fixed (`{{ }}` dentro de string) com conteúdo que tem quebras de linha/aspas | Usar modo **Expression** no campo inteiro com `{ reply: $json.output }` (sem aspas envolvendo a expressão) |
| Resposta trocando de idioma (para mandarim) no meio do texto | Viés conhecido de modelos Qwen em respostas longas | Adicionar instrução explícita de idioma no início do System Prompt |
| Resposta demorando vários minutos | Modelo 7B rodando em CPU sem GPU dedicada | Trocar para modelo menor (`qwen2.5:3b`) |
| `Ops, houve um erro ao me comunicar com o servidor` ao acessar de outro dispositivo | Mixed Content: navegador bloqueia chamada HTTPS → HTTP | Usar túnel HTTPS (ngrok) para expor o backend |
| Erro 500 no `OPTIONS` do ngrok | Workflow não publicado e/ou CORS do Webhook mal configurado | Confirmar publicação do workflow e configuração de CORS (`*`) |
| Página de aviso do ngrok bloqueando a chamada | Plano gratuito do ngrok mostra um interstitial na primeira visita | Adicionar header `ngrok-skip-browser-warning: true` na chamada Axios |
| Workflow "sumiu" ao reabrir o n8n | Pasta do projeto foi renomeada, criando um novo volume Docker vazio (o nome da pasta prefixa o nome do volume) | Fixar o nome do projeto com `COMPOSE_PROJECT_NAME` no `.env`, independente do nome da pasta |
| Markdown aparecendo cru na tela (` ``` `, `**`, etc.) | O texto do bot nunca era de fato renderizado como markdown | Adicionar `react-markdown` + `remark-gfm` para renderização real |

---

## Restrições do projeto

- **O backend não fica online 24/7.** Como o Ollama roda localmente (sem custo), o computador do host precisa estar ligado, com o Docker e o ngrok ativos, para que qualquer pessoa consiga de fato conversar com o bot através do link público.
- **Modelo de 3B tem qualidade menor que modelos maiores/comerciais.** É uma escolha consciente para viabilizar velocidade de resposta em CPU sem custo de API.
- **Sem classificação de intenção.** O projeto usa um único prompt de sistema bem elaborado, em vez de um nó de IA dedicado a classificar o tipo de pergunta antes de responder (abordagem mais simples, mencionada como possível evolução).

---

## Possíveis evoluções futuras

- Adicionar um nó de classificação de intenção no n8n, direcionando para prompts especializados por tipo de pergunta.
- Hospedar o backend em um servidor real (ex: Oracle Cloud Free Tier) para deixar o projeto acessível 24/7 sem depender da máquina do host.
- Adicionar histórico de conversas persistente (atualmente a memória dura apenas enquanto a aba do navegador está aberta).
- Testes automatizados para validar a qualidade das respostas do bot em diferentes tipos de pergunta.

---

## Autor

Desenvolvido por [Bruno Eduardo](https://github.com/brunofoglake) como projeto de portfólio, unindo automação de IA (n8n + LLM open source) e desenvolvimento web (React).
