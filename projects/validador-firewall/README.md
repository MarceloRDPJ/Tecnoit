# Validador de MACs para Firewall - TecnoIT

## 📖 Descrição

Esta é uma ferramenta front-end de página única, desenvolvida para otimizar e automatizar a criação de scripts de configuração de firewall a partir de uma lista de equipamentos e seus respectivos endereços MAC. A aplicação valida, formata e converte os dados de um arquivo `.csv` em um script `.txt` pronto para ser importado no firewall, além de gerar um relatório detalhado de quaisquer inconsistências encontradas.

O design foi pensado para ser intuitivo e profissional, refletindo a identidade visual da TecnoIT, com um tema escuro, animações sutis e foco na experiência do usuário.

## ✨ Funcionalidades Principais

-   **Upload de Arquivo:** Interface de "arrastar e soltar" (drag-and-drop) ou seleção de arquivo para carregar a lista de MACs em formato `.csv`.
-   **Validação Abrangente:** O script realiza as seguintes verificações:
    -   Formato correto do endereço MAC.
    -   Detecção de nomes de equipamentos duplicados.
    -   Detecção de endereços MAC duplicados.
    -   Verificação de linhas com dados ausentes ou incompletos.
-   **Conversão Automática:** Endereços MAC em diferentes formatos (ex: `AA-BB-CC-11-22-33`) são automaticamente convertidos para o padrão do firewall (`AA:BB:CC:11:22:33`) em maiúsculas.
-   **Geração de Saídas:**
    -   **Script de Sucesso (`.txt`):** Gera um arquivo de texto com os comandos de configuração para todos os MACs válidos.
    -   **Relatório de Erros (`.csv`):** Cria um arquivo CSV com a lista de todas as entradas que falharam na validação, incluindo o motivo específico do erro para fácil correção.
-   **Download de Modelo:** Inclui um botão para baixar um arquivo `.csv` de exemplo, garantindo que o usuário utilize o formato correto.
-   **Resumo Visual:** Apresenta um painel de resultados claro, mostrando o total de linhas processadas, o número de sucessos e o número de falhas.

## 🚀 Como Usar

1.  **Abra o arquivo `Validador_firewall.html`** em qualquer navegador de internet moderno (Google Chrome, Firefox, etc.).
2.  **Carregue o Arquivo:** Arraste e solte seu arquivo `.csv` na área indicada ou clique para selecioná-lo.
3.  **Processe:** Clique no botão "Validar & Converter".
4.  **Baixe os Resultados:** Após o processamento, os links para download do script `.txt` e do relatório de erros `.csv` (se houver) aparecerão na área de resultados.

## 📋 Requisitos do Arquivo de Entrada

-   **Formato:** O arquivo deve ser `.csv`.
-   **Delimitador:** As colunas devem ser separadas por **ponto e vírgula (`;`)**.
-   **Estrutura:**
    -   **Coluna A:** Nome do Equipamento.
    -   **Coluna B:** Endereço MAC.

## 🛠️ Tecnologias Utilizadas

-   **HTML5:** Estrutura semântica da página.
-   **Tailwind CSS:** Framework de CSS para estilização rápida e moderna (utilizado via CDN).
-   **JavaScript (Vanilla):** Lógica de validação, processamento de arquivos e manipulação do DOM, sem a necessidade de frameworks externos.

---
*Powered by TecnoIT © 2025*
