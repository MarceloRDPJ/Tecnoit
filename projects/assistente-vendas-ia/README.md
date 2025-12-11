# RDP STUDIO - Assistente de Vendas IA

## Visão Geral / Overview
[PT] O **Assistente de Vendas IA** é uma solução de automação comercial projetada para operar dentro do Telegram. Ele atua como um funcionário virtual 24/7, gerenciando o estoque, respondendo dúvidas de clientes e processando vendas automaticamente. O diferencial é a integração com LLMs (Gemini) para linguagem natural e visão computacional para validação de pagamentos (Pix).

[EN] The **AI Sales Assistant** is a commercial automation solution designed to operate within Telegram. It acts as a 24/7 virtual employee, managing inventory, answering customer queries, and processing sales automatically. Its key differentiator is the integration with LLMs (Gemini) for natural language and computer vision for payment validation (Pix).

## Arquitetura / Architecture
- **Interface:** Telegram Bot API
- **Core Logic:** Python (FastAPI/Aiogram)
- **Intelligence:** Google Gemini 1.5 Pro (NLP + Vision)
- **Database:** Supabase (PostgreSQL) for inventory and transaction logs.
- **Hosting:** Render / Docker Containers

## Funcionalidades / Features
1. **Atendimento Humanizado:** Respostas contextuais e empáticas, não robóticas.
2. **Controle de Estoque Real-Time:** Baixa automática de itens vendidos.
3. **Validação de Comprovante:** Leitura de imagens para confirmar transações bancárias.
4. **Painel do Lojista:** Comandos administrativos para repor estoque e ver relatórios.

## Como Executar / How to Run
Este é um projeto demonstrativo estático. A versão de produção roda em containers Docker privados.
Para ver a interface simulada, abra o arquivo `index.html` no navegador.

This is a static demo project. The production version runs in private Docker containers.
To view the simulated interface, open `index.html` in your browser.

---
© 2025 RDP STUDIO
