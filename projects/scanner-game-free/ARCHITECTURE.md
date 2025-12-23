# Arquitetura do Sistema RDP Insider (v3.0)

## Visão Geral
O **RDP Insider** é um agregador de inteligência geek automatizado, focado em jogos gratuitos da Epic Games, vazamentos de hardware e notícias da indústria. O sistema opera sob uma arquitetura **Híbrida Serverless**, utilizando Python para coleta de dados e React (Client-Side) para exibição.

## Estrutura Técnica

### 1. Data Engine (Backend)
O núcleo do sistema é o script `data_engine/crawler.py`, responsável por:
*   **Coleta de Dados**: Conecta-se à API oficial da Epic Games Store e feeds RSS de portais confiáveis (Eurogamer, TechPowerUp).
*   **Tratamento e Tradução**: Utiliza `BeautifulSoup` para limpeza de HTML e `deep-translator` para localização automática do conteúdo para PT-BR.
*   **Validação de Frescor**: Implementa lógica para descartar notícias com mais de 48 horas.
*   **Persistência**: Gera um arquivo estático `data/db.json` que serve como "banco de dados" para o frontend.

### 2. Frontend (React + Tailwind)
A interface foi refatorada para uma estrutura modular sem necessidade de build (No-Build Step), ideal para hospedagem em GitHub Pages.
*   **Componentização**: A lógica de UI foi dividida em componentes funcionais (`NavBar`, `EpicDashboard`, `NewsCard`).
*   **Transparência de Dados**: O frontend verifica o timestamp `last_updated` do JSON.
    *   **Verde**: Dados frescos (< 24h).
    *   **Amarelo**: Aviso de desatualização (24h - 48h).
    *   **Vermelho**: Sistema Offline ou dados obsoletos (> 48h).

### 3. Automação
Recomenda-se a execução do `crawler.py` via **GitHub Actions** diariamente (cron schedule) para manter o `db.json` atualizado automaticamente.

## Fluxo de Dados

1.  **Crawler (Python)** inicia execução.
2.  Consulta **Epic API** para jogos grátis atuais e futuros.
3.  Consulta **Feeds RSS** (Eurogamer, TechPowerUp) para notícias.
4.  Aplica filtros de tags (ex: "leaks", "hardware").
5.  Traduz títulos e resumos para Português.
6.  Salva resultados em `data/db.json` com timestamp ISO.
7.  **Frontend (Browser)** carrega `db.json`.
8.  Calcula a diferença de tempo e define o status do sistema (Online/Warning/Offline).
9.  Renderiza o conteúdo para o usuário.

## Tecnologias Utilizadas
*   **Linguagem**: Python 3.11+, JavaScript (ES6+)
*   **Libs Python**: `requests`, `feedparser`, `beautifulsoup4`, `deep-translator`
*   **Libs JS**: React 18, ReactDOM 18, Babel Standalone, Tailwind CSS (CDN)
*   **Fonte de Dados**: Epic Games Store API, RSS Feeds

## Manutenção
Para adicionar novas fontes, edite a lista `SOURCES` em `data_engine/crawler.py`. O sistema tentará processar automaticamente qualquer feed RSS válido adicionado.
