# RDP Insider | Scanner Geek

![Status](https://img.shields.io/badge/status-active-success.svg?style=flat-square)
![Tech](https://img.shields.io/badge/Python-Crawler-yellow.svg?style=flat-square)
![Tech](https://img.shields.io/badge/React-Frontend-blue.svg?style=flat-square)

> **Inteligência de Mercado e Vazamentos Gamers.**
> Plataforma de monitoramento de rumores, vazamentos de hardware e jogos gratuitos, com validação cruzada de fontes.

---

## 📋 Visão Geral

O **RDP Insider** é a evolução do antigo "Scanner Games Free". Agora, ele opera como um blog de inteligência geek que utiliza um motor de coleta de dados (Crawler) para agregar informações de múltiplas fontes da comunidade (Reddit, Portais de Notícias, etc.).

O sistema cruza dados para fornecer um **Índice de Confiabilidade** para cada rumor ou vazamento.

### Arquitetura "Option B" (Híbrida)
Devido às limitações de CORS e performance em navegadores (GitHub Pages), este projeto utiliza uma arquitetura híbrida:

1.  **Data Engine (Python):** Um script local (`crawler.py`) varre a web, processa os dados e gera um arquivo estático `db.json`.
2.  **Frontend (React):** O site consome este arquivo JSON para exibir as notícias com performance instantânea e zero latência de API.

### Funcionalidades
- 🕵️ **Validação de Rumores:** Algoritmo que classifica a confiabilidade (Baixa, Média, Alta) baseado no volume de discussão.
- 🎮 **Cobertura Completa:** Jogos Grátis, Hardware (Nvidia/AMD), Datas de Lançamento e Vazamentos AAA.
- 📱 **Interface Moderna:** Design responsivo com Glassmorphism, seguindo a identidade visual RDP Studio.

---

## 🚀 Como Atualizar os Dados

Como o site é estático, os dados precisam ser atualizados executando o crawler.

### Pré-requisitos
- Python 3.8+
- Conexão com a Internet

### Passo a Passo

1. Navegue até o diretório do projeto:
   ```bash
   cd projects/scanner-game-free
   ```

2. Execute o Crawler:
   ```bash
   python3 data_engine/crawler.py
   ```
   *O script irá gerar um novo arquivo em `data/db.json`.*

3. Faça o commit e push das alterações para o GitHub:
   ```bash
   git add data/db.json
   git commit -m "update: atualização diária de vazamentos"
   git push
   ```

---

## 🛠️ Stack Tecnológica

- **Backend / Data:** Python 3 (urllib, json)
- **Frontend:** React.js 18 (CDN), Tailwind CSS
- **Hospedagem:** GitHub Pages

---

**© 2025 RDP STUDIO.** Desenvolvido por Marcelo Rodrigues.
