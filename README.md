# 🌍 Dynamic App Template (Next.js + FastAPI)

Este é um template completo "Headless CMS" *open-source* projetado para permitir a criação ágil de painéis administrativos modernos, garantindo escalabilidade técnica. Ele foi desenvolvido com o conceito de gerar tabelas físicas e criar CRUDs visuais dinamicamente (com infinitas páginas adaptadas pelo roteamento). Esse projeto **não usa placeholders**! Todo o schema criado em tela é executado em instruções de Banco de Dados reais.

## 🎓 A História (+ Iniciação Científica)

Este template é uma refatoração massiva **esculpida no padrão ouro do mercado** (State-of-the-Art Architecture). A ideia original e os conceitos de roteamento dinâmico nasceram através do meu projeto de **Iniciação Científica**, que primeiramente foi inteiramente arquitetado utilizando ferramentas como **Flask (Python), HTML estático, CSS puro e banco de dados SQLite**.

Para elevar este projeto experimental à maturidade corporativa e ao alto nível técnico, a stack foi migrada e reescrita do zero. Onde antes haviam templates estáticos com recarregamento na tela inteira (`Jinja2`), deu lugar à nova API `app/` do Next.js; e onde as rotas Python entregavam tela, o FastAPI se estabeleceu puramente para gestão inteligente de rotas e migrações.

## 🏗 Estrutura da Solução

- **`/frontend` (Next.js 14+)**: Aplicação baseada no revolucionário App Router. Interface responsiva, interativa, criada sob o poder do Tailwind CSS e animada com o Framer Motion. 
- **`/backend` (FastAPI + SQLAlchemy)**: A API performática construída inteiramente em assincronismo (Python async). Se destaca pelas *engines dinâmicas* (como `dynamic_schema.py`) encarregadas de traduzir o recebimento do front em DDL's puras e transações que rodam direto pelo banco.

---

## 🚀 Como Rodar Localmente

### 1. Preparando o Backend (API)
Abra um terminal, vá para a pasta `backend` e crie seu ambiente virtual isolado para não poluir sua máquina:
```bash
cd backend
python -m venv venv
```
*(No Windows)*
```bash
.\venv\Scripts\activate
```
*(No Mac/Linux)*
```bash
source venv/bin/activate
```
Com o ambiente ativado, instale as dependências:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
A API inicializará de imediato no endereço `http://localhost:8000`.

### 2. Preparando o Frontend
Em um novo terminal (mantendo o do backend rondando), vá para a pasta `frontend` e baixe os pacotes essenciais do repositório NPM:
```bash
cd frontend
npm install
npm run dev
```

Pronto! Acesse pelo seu navegador a URL `http://localhost:3000`. 
-  **Home Pública**: `http://localhost:3000/`
-  **Painel Admin**: `http://localhost:3000/admin`
-  **Visualização Dinâmica de Tudo**: `http://localhost:3000/dashboard`

---

## ☁️ Guia Definitivo de Implantação (Deployment em Produção)

Colocar esse sistema complexo **com duas engrenagens diferentes** para funcionar em nuvem não é nenhum enigma, mas exige alguns passos cuidadosos devido às tecnologias envolvidas. **Não** utilize *SQLite* local na nuvem (explicamos abaixo o porquê). 

O mercado hoje recomenda o seguinte split de implantação: **Frontend vai para a Vercel** e o **Backend em Python vai para Render/Railway**.

### Parte 1: O Banco de Dados (Por que não SQLite em nuvem?)
Máquinas gratuitas de hospedagem e *Serverless Functions* da Vercel sobem ambientes efêmeros; se o sistema reiniciar, o arquivo `.db` gerado com todos os dados dos seus clientes será pulverizado. 
*A Solução:* Salve os dados nativamente no serviço da plataforma.
1. Se você for subir o frontend na Vercel (recomendado), crie um componente de **Vercel Postgres** na aba Storage do seu projeto Vercel (que nada mais é que o gigante Neon DB disfarçado).
2. Ao criar, a Vercel te fornecerá uma Variável de Ambiente generosa chamada `POSTGRES_URL` ou `DATABASE_URL` no formato (`postgres://usuario:senha@servidor...`). **Guarde ela!**

### Parte 2: Implantando o Backend (FastAPI no Render) 
Serviços como o *"Render"* são perfeitos pra segurar sua API FastAPI.
1. Crie seu projeto *Web Service* ligando os arquivos à sua conta do Github.
2. Em **Root Directory** aponte: `backend`.
3. Em **Build Command** cole: `pip install -r requirements.txt` (Dica: se não existir o requirements.txt localmente, antes do commit rode `pip freeze > requirements.txt`).
4. Em **Start Command** cole: `uvicorn main:app --host 0.0.0.0 --port $PORT` *(esse `$PORT` precisa ser assim por causa da nuvem!)*.
5. Em **Variáveis de Ambiente** do Render, clique em "Add Environment Variable":
  - `DATABASE_URL`: Cole a URL gigante gerada na etapa 1 para que seu sistema mude o direcionamento e aponte os metadados do SQL para o Servidor Master lá da Vercel!!

### Parte 3: Implantando o Frontend (Next.js na Vercel)
A Vercel foi feita sob medida para o seu React/Next.js! A performance aqui será absurda.
1. Conecte o repositório.
2. Nas configurações primárias, defina o **Framework Preset** como *"Next.js"* e o **Root Directory** como `frontend`.
3. Nas Variáveis de Ambiente (*Environment Variables*), você precisa mapear para o Front em qual lugar do mundo o seu Backend foi alocado lá no Render:
  - Adicione a chave: `NEXT_PUBLIC_API_URL`
  - Com o valor: `https://seu-servico-lindo.onrender.com` (o link HTTPS gerado com sucesso no final do passo dois).
4. Clique em Build!

Seu projeto que nasceu em uma Iniciação Cientifica acaba de virar uma máquina formidável para a escalabilidade de software moderno! 🎉
