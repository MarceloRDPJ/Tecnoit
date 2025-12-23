# Interface Inicial (Hub)

Este diretório contém os arquivos principais que compõem a "vitrine" do portfólio RDP Studio.
Devido à organização do repositório, a interface principal foi movida para cá para manter a raiz limpa.

## 📂 Arquivos

### 1. [index.html](./index.html)
A página inicial (Home).
- Contém a seção "Hero" com a apresentação da marca.
- Exibe métricas em tempo real (fictícias ou via API GitHub).
- Apresenta o carrossel de clientes e princípios da empresa (DevSecOps, IaC, IA).

### 2. [projetos.html](./projetos.html)
O catálogo de projetos.
- Lista todos os subprojetos disponíveis no repositório (`../projects/`).
- Utiliza um grid responsivo para exibir os cards dos projetos.
- Cada card deve ter links diretos para a demonstração (`demo`) e código (`source`).

### 3. [sobre.html](./sobre.html)
A página "Sobre Mim".
- Detalha a trajetória profissional, certificações e educação.
- Focada em "Personal Branding".

## 🛠️ Manutenção

**Atenção aos Links Relativos:**
Como estes arquivos não estão mais na raiz, todos os links para recursos globais devem subir um nível:
- Imagens: `../assets/...`
- Projetos: `../projects/...`
- CSS/JS Globais (se houver): `../assets/...`

**Redirecionamento:**
O arquivo `index.html` na raiz do repositório (`../index.html`) serve apenas como um "trampolim", redirecionando o tráfego automaticamente para esta pasta (`hub/`).
