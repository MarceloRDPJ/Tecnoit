# Protocolo de Atualização e Contribuição

> **IMPORTANTE: Identidade Visual**
> Este portfólio opera sob a identidade "RDP STUDIO".
> **Manutenção:** Mantenha a consistência visual seguindo o `BRANDBOOK.md` e verifique os comentários `<!-- TODO: REPLACE_BRANDING -->` apenas se houver uma nova reformulação de marca planejada.

## 1. Princípios de Excelência
Este repositório segue um padrão rigoroso de qualidade. Profissionalismo e competência são os pilares.
- **Documentação Viva:** Nenhuma alteração de código ("nem uma vírgula") deve ser feita sem a atualização correspondente na documentação ou changelog.
- **Design System:** Todo novo componente deve aderir ao `BRANDBOOK.md`. Não crie estilos inline que fujam do padrão Glassmorphism/Ultra Modern.

## 2. Adicionando Novos Projetos
Para adicionar um novo projeto ao Hub (`index.html`), siga estritamente este checklist:

### 2.1 Estrutura de Arquivos
1. Crie a pasta em `projects/nome-do-projeto/`.
2. O arquivo principal deve ser `index.html`.
3. Siga o layout padrão (Header com "Voltar ao Hub", Container Glassmorphism, Footer com Watermark).

### 2.2 Registro no Hub (Card)
Ao adicionar o card em `index.html`, você **DEVE** incluir os atributos de dados para busca e filtragem:

```html
<!-- Exemplo de Card Padronizado -->
<div class="glass-card ..." data-category="automacao" data-tags="python api backend">
    <!-- Conteúdo Visual -->
    <div class="tags-container">
        <span class="tag">Python</span>
        <span class="tag">API</span>
    </div>
    <!-- ... -->
</div>
```

- **data-category**: Categoria principal (ex: `automacao`, `seguranca`, `geek`, `frontend`).
- **data-tags**: Lista de tecnologias separadas por espaço.

### 2.3 Atualização de Filtros
Se criar uma nova categoria, adicione o botão correspondente na seção de filtros do `index.html`:
```html
<button class="filter-btn" data-filter="nova-categoria">Nova Categoria</button>
```

## 3. Guia de Manutenção
- **Commits:** Mensagens claras, em português, descrevendo o *porquê* da mudança, não apenas o *o quê*.
- **Backups:** Antes de alterações críticas, crie uma tag de versão (`git tag v1.X-backup`).

## 4. Contato e Identidade
As informações de contato devem ser mantidas profissionais.
- LinkedIn
- GitHub
- Email Profissional

---
*Documento regido pelos padrões de qualidade estabelecidos por Marcelo Rodrigues.*
