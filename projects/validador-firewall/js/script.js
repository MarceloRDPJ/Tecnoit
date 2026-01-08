// --- MOBILE MENU LOGIC ---
const menuBtn = document.getElementById('mobile-menu-btn');
const menuOverlay = document.getElementById('mobile-menu-overlay');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        const icon = menuBtn.querySelector('i');
        if (isMenuOpen) {
            menuOverlay.classList.remove('translate-x-full');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
            document.body.style.overflow = 'hidden';
        } else {
            menuOverlay.classList.add('translate-x-full');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
            document.body.style.overflow = 'auto';
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            menuOverlay.classList.add('translate-x-full');
            const icon = menuBtn.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
            document.body.style.overflow = 'auto';
        });
    });
}

// --- JS LOGIC ---
const dataInput = document.getElementById('dataInput');
const fileInput = document.getElementById('fileInput');
const processButton = document.getElementById('processButton');
const clearButton = document.getElementById('clearButton');
const resultsArea = document.getElementById('resultsArea');
const emptyState = document.getElementById('emptyState');
const summaryDisplay = document.getElementById('summary');
const downloadTemplateButton = document.getElementById('downloadTemplateButton');

const cardObjects = document.getElementById('cardObjects');
const badgeObjects = document.getElementById('badgeObjects');
const downloadObjects = document.getElementById('downloadObjects');

const cardGroup = document.getElementById('cardGroup');
const badgeGroup = document.getElementById('badgeGroup');
const downloadGroup = document.getElementById('downloadGroup');

const cardErrors = document.getElementById('cardErrors');
const badgeErrors = document.getElementById('badgeErrors');
const downloadErrors = document.getElementById('downloadErrors');

// Info Toggle Logic
const toggleInfoBtn = document.getElementById('toggleInfoBtn');
const infoSection = document.getElementById('infoSection');
const infoChevron = document.getElementById('infoChevron');

if (toggleInfoBtn && infoSection) {
    toggleInfoBtn.addEventListener('click', () => {
        infoSection.classList.toggle('hidden');
        if (infoSection.classList.contains('hidden')) {
            infoChevron.style.transform = 'rotate(0deg)';
        } else {
            infoChevron.style.transform = 'rotate(180deg)';
        }
    });
}

let generatedObjectsScript = "";
let generatedGroupScript = "";
let generatedErrorsData = [];

if (clearButton) {
    clearButton.addEventListener('click', () => {
        dataInput.value = '';
        fileInput.value = '';
        dataInput.focus();
        // Reset Result View
        if (emptyState) emptyState.classList.remove('hidden');
        if (summaryDisplay) summaryDisplay.innerHTML = '';
        cardObjects.classList.add('hidden');
        cardGroup.classList.add('hidden');
        cardErrors.classList.add('hidden');
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dataInput.value = e.target.result;
            };
            reader.readAsText(file, 'iso-8859-1');
        }
        dataInput.focus();
        // Reset view on new input? Maybe not necessary, but cleaner.
        if (emptyState) emptyState.classList.remove('hidden');
        cardObjects.classList.add('hidden');
        cardGroup.classList.add('hidden');
        cardErrors.classList.add('hidden');
    });
}

if (processButton) {
    processButton.addEventListener('click', () => {
        const content = dataInput.value;
        if (!content.trim()) {
            alert("Por favor, cole os dados no campo de texto.");
            return;
        }

        const btnText = processButton.querySelector('span');
        btnText.innerText = "PROCESSANDO...";
        processButton.disabled = true;

        // Don't hide resultsArea, just reset cards
        if (emptyState) emptyState.classList.remove('hidden');
        cardObjects.classList.add('hidden');
        cardGroup.classList.add('hidden');
        cardErrors.classList.add('hidden');
        if (summaryDisplay) summaryDisplay.innerHTML = '';

        setTimeout(() => {
            processData(content);
            btnText.innerText = "VALIDAR NOVAMENTE";
            processButton.disabled = false;
        }, 500);
    });
}

if (downloadTemplateButton) {
    downloadTemplateButton.addEventListener('click', (e) => {
        e.preventDefault();
        const csvTemplateContent = [
            "Equipamento;ENDEREÇO MAC",
            "RDPSTUDIO-Server-01;AA-BB-CC-11-22-33",
            "RDPSTUDIO-Wifi-Guest;00:11:22:AA:BB:CC"
        ].join('\n');
        const blob = new Blob(["\uFEFF" + csvTemplateContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'modelo_rdpstudio.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function processData(content) {
    const outputLines = [];
    const linhasComErro = [['Equipamento', 'MAC (Original)', 'Motivo do Erro']];
    const listaObjetos = [];
    const macsVistos = {};
    const nomesVistos = {};
    const macRegex = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;

    const linhas = content.split(/\r?\n/);
    let linhasProcessadas = 0;

    for (let i = 0; i < linhas.length; i++) {
        const linhaOriginal = linhas[i];
        const linhaNumero = i + 1;
        if (!linhaOriginal.trim()) continue;

        let tokens = [];
        if (linhaOriginal.includes('\t')) tokens = linhaOriginal.split('\t');
        else if (linhaOriginal.includes(';')) tokens = linhaOriginal.split(';');
        else if (linhaOriginal.includes(',')) tokens = linhaOriginal.split(',');
        else tokens = linhaOriginal.trim().split(/\s+/);

        tokens = tokens.map(t => t.trim()).filter(t => t !== "");
        if (tokens.length > 0) {
            const firstTokenLower = tokens[0].toLowerCase();
            if (firstTokenLower === "equipamento" || firstTokenLower === "name" || firstTokenLower === "nome") continue;
        }

        linhasProcessadas++;
        let equipamento = "";
        let macOriginal = "";

        if (tokens.length >= 2) {
            equipamento = tokens[0];
            macOriginal = tokens[1];
        } else {
             linhasComErro.push(['Linha Incompleta', linhaOriginal, `Linha ${linhaNumero}: Menos de 2 colunas detectadas`]);
             continue;
        }

        const macLimpo = macOriginal.replace(/[\s."\-]/g, '');
        let macFormatado = '';
        if (macLimpo.length === 12) {
             macFormatado = macLimpo.match(/.{1,2}/g).join(':').toUpperCase();
        } else {
             macFormatado = macOriginal.replace(/-/g, ':').toUpperCase();
        }

        if (!macRegex.test(macFormatado)) {
            linhasComErro.push([equipamento, macOriginal, `Linha ${linhaNumero}: Formato inválido (${macFormatado})`]);
            continue;
        }
        if (nomesVistos.hasOwnProperty(equipamento)) {
            linhasComErro.push([equipamento, macOriginal, `Linha ${linhaNumero}: Nome duplicado`]);
            continue;
        }
        if (macsVistos.hasOwnProperty(macFormatado)) {
            linhasComErro.push([equipamento, macOriginal, `Linha ${linhaNumero}: MAC duplicado`]);
            continue;
        }

        nomesVistos[equipamento] = linhaNumero;
        macsVistos[macFormatado] = linhaNumero;
        listaObjetos.push(equipamento);

        outputLines.push(`edit "${equipamento}"`);
        outputLines.push('set type mac');
        outputLines.push(`set macaddr ${macFormatado}`);
        outputLines.push('set color 13');
        outputLines.push('next');
    }

    const numSucesso = outputLines.length / 5;
    const numErros = linhasComErro.length - 1;

    if (numSucesso > 0) {
        generatedObjectsScript = 'config firewall address\n' + outputLines.join('\n') + '\nend\n';
        const blob = new Blob(["\uFEFF" + generatedObjectsScript], { type: 'text/plain;charset=utf-8' });
        downloadObjects.href = URL.createObjectURL(blob);
        downloadObjects.download = 'config_firewall_OBJ.txt';
        badgeObjects.innerText = `${numSucesso} OK`;
        cardObjects.classList.remove('hidden');
    }

    if (numSucesso > 0) {
        const membersString = listaObjetos.map(nome => `"${nome}"`).join(' ');
        generatedGroupScript = [
            'config firewall addrgrp',
            'edit "macs_liberados"',
            `set member ${membersString}`,
            'set color 13',
            'next',
            'end\n'
        ].join('\n');
        const blob = new Blob(["\uFEFF" + generatedGroupScript], { type: 'text/plain;charset=utf-8' });
        downloadGroup.href = URL.createObjectURL(blob);
        downloadGroup.download = 'macs_liberados_GRP.txt';
        badgeGroup.innerText = `${numSucesso} Membros`;
        cardGroup.classList.remove('hidden');
    }

    if (numErros > 0) {
        generatedErrorsData = linhasComErro;
        const csvContent = linhasComErro.map(row => row.join(';')).join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
        downloadErrors.href = URL.createObjectURL(blob);
        downloadErrors.download = 'erros_validacao.csv';
        badgeErrors.innerText = `${numErros} Erros`;
        cardErrors.classList.remove('hidden');
    }

    summaryDisplay.innerHTML = `
        <div class="px-3 py-1 rounded bg-slate-800 text-xs text-slate-400 border border-white/5">Total: <span class="text-white font-bold">${linhasProcessadas}</span></div>
        <div class="px-3 py-1 rounded bg-trustGreen/10 text-xs text-trustGreen border border-trustGreen/20">Válidos: <span class="font-bold">${numSucesso}</span></div>
        <div class="px-3 py-1 rounded bg-red-500/10 text-xs text-red-400 border border-red-500/20">Erros: <span class="font-bold">${numErros}</span></div>
    `;

    // Hide empty state and show results
    if (emptyState) emptyState.classList.add('hidden');
    // resultsArea is always visible now
}

const modal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCopyBtn = document.getElementById('modalCopyBtn');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const toast = document.getElementById('toast');

function openModal(type) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalCopyBtn.classList.add('hidden');
    modalDownloadBtn.classList.add('hidden');
    modalCopyBtn.onclick = null;

    if (type === 'objects') {
        modalTitle.innerHTML = `<span class="text-trustGreen font-mono">#</span> Script de Objetos`;
        modalBody.innerHTML = `<pre class="p-6 text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">${escapeHtml(generatedObjectsScript)}</pre>`;
        modalCopyBtn.classList.remove('hidden');
        modalCopyBtn.onclick = () => copyToClipboard(generatedObjectsScript);
        modalDownloadBtn.classList.remove('hidden');
        modalDownloadBtn.href = downloadObjects.href;
        modalDownloadBtn.download = downloadObjects.download;
    }
    else if (type === 'group') {
        modalTitle.innerHTML = `<span class="text-vibrantCyan font-mono">@</span> Script de Grupo`;
        modalBody.innerHTML = `<pre class="p-6 text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">${escapeHtml(generatedGroupScript)}</pre>`;
        modalCopyBtn.classList.remove('hidden');
        modalCopyBtn.onclick = () => copyToClipboard(generatedGroupScript);
        modalDownloadBtn.classList.remove('hidden');
        modalDownloadBtn.href = downloadGroup.href;
        modalDownloadBtn.download = downloadGroup.download;
    }
    else if (type === 'errors') {
        modalTitle.innerHTML = `<span class="text-red-400 font-mono">!</span> Relatório de Falhas`;
        let tableHtml = `
            <div class="w-full">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="bg-slate-800/50 text-slate-400 border-b border-white/5">
                            <th class="p-4 font-semibold">Equipamento</th>
                            <th class="p-4 font-semibold">MAC Original</th>
                            <th class="p-4 font-semibold">Erro</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
        `;
        for (let i = 1; i < generatedErrorsData.length; i++) {
            const row = generatedErrorsData[i];
            tableHtml += `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="p-4 font-mono text-white">${row[0] || '-'}</td>
                    <td class="p-4 font-mono text-slate-400">${row[1] || '-'}</td>
                    <td class="p-4 text-red-400 font-medium">${row[2] || '-'}</td>
                </tr>
            `;
        }
        tableHtml += `</tbody></table></div>`;
        modalBody.innerHTML = tableHtml;
        modalDownloadBtn.classList.remove('hidden');
        modalDownloadBtn.href = downloadErrors.href;
        modalDownloadBtn.download = downloadErrors.download;
    }
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

if (modal) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        alert("Erro ao copiar.");
    });
}

function showToast() {
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
