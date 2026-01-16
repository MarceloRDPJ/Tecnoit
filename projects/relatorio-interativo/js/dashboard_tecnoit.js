const App = {
    rawData: [],
    filteredData: [],
    charts: {},
    pendingFiles: [],

    init: () => {
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#64748b';
        App.setupDragAndDrop();
    },

    // --- NAVEGAÇÃO ---
    switchView: (view) => {
        document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('[id^="btn-view-"]').forEach(el => el.classList.remove('bg-orange-50', 'text-orange-600'));

        document.getElementById('view-' + view).classList.remove('hidden');
        document.getElementById('btn-view-' + view).classList.add('bg-orange-50', 'text-orange-600');

        if (view === 'report' && App.rawData.length) App.populateReportFilters();
        if (view === 'debug' && App.rawData.length) App.renderDebugTable();
    },

    // --- ARQUIVOS ---
    handleFiles: (files) => {
        if(!files.length) return;
        Array.from(files).forEach(f => App.pendingFiles.push(f));
        App.renderFileList();
        document.getElementById('btn-process-all').classList.remove('hidden');
    },
    removeFile: (idx) => {
        App.pendingFiles.splice(idx, 1);
        App.renderFileList();
        if(!App.pendingFiles.length) {
            document.getElementById('file-list').classList.add('hidden');
            document.getElementById('btn-process-all').classList.add('hidden');
        }
    },
    renderFileList: () => {
        const list = document.getElementById('file-list');
        list.classList.remove('hidden');
        list.innerHTML = App.pendingFiles.map((f, i) => `
            <div class="file-item flex justify-between items-center p-2 bg-white border border-slate-200 rounded text-xs">
                <span class="font-mono text-slate-600 truncate">${f.name}</span>
                <button onclick="App.removeFile(${i})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    },

    processAllFiles: async () => {
        const loading = document.getElementById('loading');
        const loadingText = document.getElementById('loading-text');
        const loadingBar = document.getElementById('loading-bar');
        loading.classList.remove('hidden');
        document.getElementById('btn-process-all').classList.add('hidden');

        let allData = [];

        for(let i=0; i<App.pendingFiles.length; i++) {
            const file = App.pendingFiles[i];
            loadingText.innerText = `Lendo arquivo ${i+1}/${App.pendingFiles.length}: ${file.name}`;
            loadingBar.style.width = `${((i+1)/App.pendingFiles.length)*30}%`;

            const rows = await App.readFile(file);

            // --- O CÉREBRO: PROCESSAMENTO EM 3 ESTÁGIOS ---
            loadingText.innerText = `Limpando Totais ${i+1}/${App.pendingFiles.length}...`;
            const parsed = App.runTriplePassProcessing(rows);
            allData = [...allData, ...parsed];
        }

        loadingBar.style.width = '100%';

        if(allData.length === 0) {
            alert("Nenhum dado válido encontrado.\n\nVerifique se o cabeçalho da planilha contém:\n- 'NATUREZA'\n- 'CENTRO DE CUSTO' (ou 'CCUSTO')\n- Meses por extenso (ex: JANEIRO, FEVEREIRO...)");
            loading.classList.add('hidden');
            document.getElementById('btn-process-all').classList.remove('hidden');
            return;
        }

        App.loadData(allData);
    },

    readFile: (file) => {
        return new Promise((resolve) => {
            if(file.name.endsWith('.csv')) {
                Papa.parse(file, { encoding: "UTF-8", complete: r => resolve(r.data) });
            } else {
                const reader = new FileReader();
                reader.onload = e => {
                    const wb = XLSX.read(e.target.result, {type: 'array'});
                    let allRows = [];
                    wb.SheetNames.forEach(sheetName => {
                        const ws = wb.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(ws, {header: 1, defval: ""});
                        allRows = [...allRows, ...json];
                    });
                    resolve(allRows);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    },

    // =========================================================================
    //             ALGORITMO DE TRIPLA CHECAGEM (V6.0 - ANTI-TOTAIS)
    // =========================================================================
    runTriplePassProcessing: (rows) => {

        // --- PASSADA 1: MAPEAMENTO E DETECÇÃO DE CABEÇALHO ---
        let headerIdx = -1;
        let colMap = { nat: -1, cc: -1, tipo: -1, months: [] };
        let maxScore = 0;
        const monthNames = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];

        for(let i=0; i<Math.min(rows.length, 100); i++) {
            let score = 0;
            const rowStr = JSON.stringify(rows[i]).toUpperCase();
            if(rowStr.includes('NATUREZA')) score += 10;
            if(rowStr.includes('CENTRO DE CUSTO') || rowStr.includes('CCUSTO')) score += 10;
            if(rowStr.includes('TIPO')) score += 5;
            monthNames.forEach(m => { if(rowStr.includes(m)) score += 2; });

            if(score > maxScore) { maxScore = score; headerIdx = i; }
        }

        if(headerIdx === -1) return [];

        // Mapear índices exatos
        const hRow = rows[headerIdx];
        hRow.forEach((cell, idx) => {
            const str = String(cell).toUpperCase().trim();
            if(str.includes('NATUREZA') && colMap.nat === -1) colMap.nat = idx;
            else if((str.includes('CENTRO DE CUSTO') || str === 'CCUSTO') && colMap.cc === -1) colMap.cc = idx;
            else if(str.includes('TIPO') && str.length < 20 && colMap.tipo === -1) colMap.tipo = idx;

            const mIdx = monthNames.findIndex(m => str.includes(m));
            if(mIdx >= 0) {
                let year = new Date().getFullYear();
                if(headerIdx > 0) {
                    const prev = rows[headerIdx-1];
                    if(prev && prev[idx] && String(prev[idx]).match(/202[0-9]/)) year = parseInt(String(prev[idx]).match(/202[0-9]/)[0]);
                    else if (prev && prev[idx-1] && String(prev[idx-1]).match(/202[0-9]/)) year = parseInt(String(prev[idx-1]).match(/202[0-9]/)[0]);
                }
                colMap.months.push({ col: idx, date: new Date(year, mIdx, 1) });
            }
        });

        if(colMap.nat === -1) colMap.nat = 3;
        if(colMap.cc === -1) colMap.cc = 9;
        if(colMap.tipo === -1) colMap.tipo = 0;

        // --- PASSADA 2: HIGIENIZAÇÃO E HIERARQUIA ---
        let validLines = [];
        let currentNature = "OUTROS";
        let currentType = "DESCONHECIDO";

        for(let i = headerIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if(!row || row.length < 2) continue;

            // 1. FILTRO DE TOTAIS RADICAL (NOVO)
            // Verifica a linha INTEIRA por segurança
            const fullRowStr = row.join(' ').toUpperCase();
            if(fullRowStr.includes('TOTAL')) {
                continue; // PULA ESSA LINHA SEM DÓ
            }

            // 2. Atualizar Tipo (se houver na linha)
            let rawType = row[colMap.tipo] ? String(row[colMap.tipo]).toUpperCase().trim() : "";
            if(rawType.includes('PAGAMENTO') || rawType.includes('DESPESA')) currentType = "DESPESA";
            else if(rawType.includes('RECEBIMENTO') || rawType.includes('RECEITA')) currentType = "RECEITA";

            // 3. Ler Natureza e CC
            let rawNat = row[colMap.nat] ? String(row[colMap.nat]).trim() : "";
            let rawCC = row[colMap.cc] ? String(row[colMap.cc]).trim() : "";
            if(rawCC === '-' || rawCC === '.') rawCC = "";

            // 4. Lógica de Pai/Filho
            if(rawNat.length > 1) {
                currentNature = rawNat;
            }

            // 5. Determina Centro de Custo Efetivo
            let finalCC = rawCC;
            if(!finalCC) finalCC = "Geral";

            validLines.push({
                origRowIdx: i,
                type: currentType,
                nature: currentNature,
                cc: finalCC,
                cells: row
            });
        }

        // --- PASSADA 3: EXTRAÇÃO DE VALORES ---
        let finalData = [];

        validLines.forEach(line => {
            colMap.months.forEach(m => {
                const val = App.parseMoney(line.cells[m.col]);
                if(Math.abs(val) > 0.001) {
                    finalData.push({
                        date: m.date,
                        type: line.type,
                        nature: line.nature,
                        cc: line.cc,
                        val: val,
                        absVal: Math.abs(val)
                    });
                }
            });
        });

        return finalData;
    },

    parseMoney: (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        let s = String(val).trim();
        if (!s || s === '-') return 0;
        s = s.replace(/[^\d\.,\-]/g, '');
        if (s.includes(',') && s.lastIndexOf(',') > s.lastIndexOf('.')) {
            s = s.replace(/\./g, '').replace(',', '.');
        } else {
            s = s.replace(/,/g, '');
        }
        const f = parseFloat(s);
        return isNaN(f) ? 0 : f;
    },

    // --- WIZARD E UI ---
    openPasteWizard: () => {
        document.getElementById('screen-upload').classList.add('hidden');
        document.getElementById('modal-wizard').classList.remove('hidden');
    },
    closeWizard: () => {
        document.getElementById('modal-wizard').classList.add('hidden');
        document.getElementById('screen-upload').classList.remove('hidden');
    },
    processPaste: () => {
        const text = document.getElementById('paste-area').value;
        const rows = text.split('\n').map(line => line.split('\t'));
        if(rows.length < 2) { alert("Dados insuficientes."); return; }
        const data = App.runTriplePassProcessing(rows);
        if(data.length === 0) { alert("Não foi possível processar os dados colados."); return; }
        App.closeWizard();
        App.loadData(data);
    },
    setupDragAndDrop: () => {
        const zone = document.getElementById('dropZone');
        ['dragenter','dragover','dragleave','drop'].forEach(e => zone.addEventListener(e, ev=>{ev.preventDefault();ev.stopPropagation()}, false));
        zone.addEventListener('drop', (e) => { if(e.dataTransfer.files.length) App.handleFiles(e.dataTransfer.files); });
    },

    // --- CARGA E DASHBOARD ---
    loadData: (data) => {
        App.rawData = data;
        document.getElementById('screen-upload').classList.add('hidden');
        document.getElementById('modal-wizard').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');

        const dates = data.map(d => d.date.getTime());
        if(dates.length) {
            document.getElementById('d-start').value = new Date(Math.min(...dates)).toISOString().split('T')[0];
            document.getElementById('d-end').value = new Date(Math.max(...dates)).toISOString().split('T')[0];
        }

        App.applyFilters();
    },

    applyFilters: () => {
        const sVal = document.getElementById('d-start').value;
        const eVal = document.getElementById('d-end').value;
        if(!sVal || !eVal) { App.filteredData = App.rawData; }
        else {
            const s = new Date(sVal + "T00:00");
            const e = new Date(eVal + "T23:59");
            App.filteredData = App.rawData.filter(d => d.date >= s && d.date <= e);
        }
        App.renderDashboard();
    },

    createShadowChart: (id, map, color, limit=5, isSimpleMap=false) => {
        const sorted = Object.entries(map)
            .map(([k,v]) => {
                let label = k;
                if(!isSimpleMap && k.includes('||')) {
                     const [cc, n] = k.split('||');
                     label = cc;
                }
                return { label: label.length > 25 ? label.substring(0,25)+'...' : label, v };
            })
            .sort((a,b) => b.v - a.v)
            .slice(0, limit);

        if(App.charts[id]) App.charts[id].destroy();

        App.charts[id] = new Chart(document.getElementById(id), {
            type: 'bar',
            data: {
                labels: sorted.map(i => i.label),
                datasets: [{
                    data: sorted.map(i => i.v),
                    backgroundColor: color,
                    borderRadius: 4,
                    barThickness: 30
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                layout: { padding: { right: 30, left: 10 } },
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                            color: '#1e293b'
                        }
                    }
                }
            }
        });
    },

    renderDashboard: () => {
        const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const d = App.filteredData;

        // KPIs
        let rec = 0, desp = 0;
        d.forEach(i => {
            if(i.type === 'RECEITA') rec += i.absVal;
            else desp += i.absVal; // Soma positivo para display
        });

        document.getElementById('kpi-rec').innerText = fmt.format(rec);
        document.getElementById('kpi-desp').innerText = fmt.format(desp * -1); // Exibe negativo

        const saldo = rec - desp;
        const kpiSaldo = document.getElementById('kpi-saldo');
        kpiSaldo.innerText = fmt.format(saldo);
        kpiSaldo.className = `text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`;

        // Agregações
        const agg = { timeline: {}, nature: {}, ccDesp: {}, ccRec: {} };

        d.forEach(x => {
            const k = x.date.toISOString().slice(0, 7);
            if(!agg.timeline[k]) agg.timeline[k] = { r: 0, d: 0 };

            if(x.type === 'RECEITA') {
                agg.timeline[k].r += x.absVal;
                agg.ccRec[x.cc + '||' + x.nature] = (agg.ccRec[x.cc + '||' + x.nature] || 0) + x.absVal;
            } else {
                agg.timeline[k].d += x.absVal;
                agg.nature[x.nature] = (agg.nature[x.nature] || 0) + x.absVal;
                agg.ccDesp[x.cc + '||' + x.nature] = (agg.ccDesp[x.cc + '||' + x.nature] || 0) + x.absVal;
            }
        });

        // Charts
        const tLabels = Object.keys(agg.timeline).sort();
        if(App.charts.timeline) App.charts.timeline.destroy();
        App.charts.timeline = new Chart(document.getElementById('chart-timeline'), {
            type: 'line',
            data: {
                labels: tLabels.map(l => {const [y,m]=l.split('-'); return `${m}/${y}`}),
                datasets: [
                    { label: 'Entradas', data: tLabels.map(l=>agg.timeline[l].r), borderColor: '#10B981', tension: 0.3 },
                    { label: 'Saídas', data: tLabels.map(l=>agg.timeline[l].d), borderColor: '#ef4444', tension: 0.3 }
                ]
            }, options: { maintainAspectRatio: false }
        });

        const topNat = Object.entries(agg.nature).sort((a,b)=>b[1]-a[1]).slice(0, 8);
        if(App.charts.pie) App.charts.pie.destroy();
        App.charts.pie = new Chart(document.getElementById('chart-pie'), {
            type: 'bar',
            data: {
                labels: topNat.map(x=>x[0]),
                datasets: [{
                    label: 'Valor (R$)',
                    data: topNat.map(x=>x[1]),
                    backgroundColor: ['#F97316','#ef4444','#f59e0b','#10b981','#3b82f6','#6366f1','#8b5cf6','#ec4899'],
                    borderRadius: 4,
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { display: false } }
                }
            }
        });

        // Tables
        const fillTable = (map, id) => {
            const sorted = Object.entries(map).map(([k,v])=>{const [cc,n]=k.split('||'); return {cc,n,v}}).sort((a,b)=>b.v-a.v).slice(0,5);
            document.getElementById(id).innerHTML = sorted.map(i => `
                <tr><td class="p-3 truncate max-w-[150px]" title="${i.cc}">${i.cc}</td><td class="p-3 text-slate-500 truncate max-w-[150px]" title="${i.n}">${i.n}</td><td class="p-3 text-right font-bold">${fmt.format(i.v)}</td></tr>
            `).join('');
        }
        fillTable(agg.ccDesp, 'table-top-desp');
        fillTable(agg.ccRec, 'table-top-rec');

        // Gera gráficos ocultos para o relatório (Alta Resolução)
        App.createShadowChart('chart-top-rec-cc', agg.ccRec, '#10b981', 5, false);
        App.createShadowChart('chart-top-desp-cc', agg.ccDesp, '#ef4444', 5, false);

        // Shadow Chart para Top Naturezas (para substituir o Pie no PDF)
        const natColors = ['#F97316','#ef4444','#f59e0b','#10b981','#3b82f6','#6366f1','#8b5cf6','#ec4899'];
        App.createShadowChart('chart-top-naturezas-report', agg.nature, natColors, 8, true);
    },

    // --- DEBUG / CONFERÊNCIA ---
    renderDebugTable: () => {
        const tbody = document.getElementById('debug-table-body');
        const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('debug-count').innerText = App.rawData.length;

        // Amostra balanceada
        const receitas = App.rawData.filter(d => d.type === 'RECEITA').slice(0, 100);
        const despesas = App.rawData.filter(d => d.type === 'DESPESA').slice(0, 100);

        const mixed = [];
        const max = Math.max(receitas.length, despesas.length);
        for(let i=0; i<max; i++) {
            if(receitas[i]) mixed.push(receitas[i]);
            if(despesas[i]) mixed.push(despesas[i]);
        }

        tbody.innerHTML = mixed.map(row => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 border-r border-slate-100 font-mono text-xs text-slate-500">${row.date.toLocaleDateString()}</td>
                <td class="p-3 border-r border-slate-100 font-bold ${row.type==='RECEITA'?'text-green-600':'text-red-600'} text-[10px] uppercase">${row.type}</td>
                <td class="p-3 border-r border-slate-100 font-medium text-blue-900 truncate max-w-[200px]" title="${row.nature}">${row.nature}</td>
                <td class="p-3 border-r border-slate-100 text-orange-700 truncate max-w-[200px]" title="${row.cc}">${row.cc}</td>
                <td class="p-3 text-right font-bold font-mono text-slate-700">${fmt.format(row.val)}</td>
            </tr>
        `).join('');
    },

    // --- RELATÓRIO PDF ---
    populateReportFilters: () => {
        const nats = [...new Set(App.rawData.map(x => x.nature))].sort();
        document.getElementById('report-filter-list').innerHTML = nats.map(n => `
            <label class="flex items-center gap-2"><input type="checkbox" value="${n}" class="report-check accent-orange-500" checked><span>${n}</span></label>
        `).join('');
    },
    toggleReportChecks: (st) => document.querySelectorAll('.report-check').forEach(c => c.checked = st),

    generateReportPreview: () => {
        const selected = Array.from(document.querySelectorAll('.report-check:checked')).map(c => c.value);
        const d = App.rawData.filter(x => selected.includes(x.nature));
        const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

        let rec = 0, desp = 0;
        d.forEach(i => i.type === 'RECEITA' ? rec += i.absVal : desp += i.absVal);

        const imgLine = App.charts.timeline.toBase64Image();
        // Usa o Shadow Chart para Top Naturezas (melhor resolução e layout de barras)
        const imgTopNat = App.charts['chart-top-naturezas-report'] ? App.charts['chart-top-naturezas-report'].toBase64Image() : '';

        const imgRecCC = App.charts['chart-top-rec-cc'] ? App.charts['chart-top-rec-cc'].toBase64Image() : '';
        const imgDespCC = App.charts['chart-top-desp-cc'] ? App.charts['chart-top-desp-cc'].toBase64Image() : '';

        // Template HTML do Relatório - Refinado
        document.getElementById('report-paper').innerHTML = `
            <div class="p-12 bg-white font-sans min-h-[1100px] flex flex-col relative">

                <!-- HEADER -->
                <div class="flex justify-between items-end border-b-2 border-orange-500 pb-6 mb-8">
                    <div class="flex items-center">
                        <img src="assets/tecnoit/logo-full.png" class="h-16 w-auto object-contain">
                    </div>
                    <div class="text-right">
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Relatório Financeiro</h1>
                        <p class="text-sm text-slate-500 mt-1">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                <!-- KPIS -->
                <div class="grid grid-cols-3 gap-6 mb-10">
                    <div class="bg-emerald-50 rounded-lg p-6 border border-emerald-100 flex flex-col justify-between items-start shadow-sm">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600"><i class="fa-solid fa-arrow-up"></i></div>
                            <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Entradas</span>
                        </div>
                        <p class="text-2xl font-bold text-emerald-900 font-mono text-left break-words w-full leading-none mt-2">${fmt.format(rec)}</p>
                    </div>

                    <div class="bg-red-50 rounded-lg p-6 border border-red-100 flex flex-col justify-between items-start shadow-sm">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="p-2 bg-red-100 rounded-lg text-red-600"><i class="fa-solid fa-arrow-down"></i></div>
                            <span class="text-xs font-bold text-red-700 uppercase tracking-wider">Saídas</span>
                        </div>
                        <p class="text-2xl font-bold text-red-900 font-mono text-left break-words w-full leading-none mt-2">${fmt.format(desp * -1)}</p>
                    </div>

                    <div class="bg-slate-50 rounded-lg p-6 border border-slate-200 flex flex-col justify-between items-start shadow-sm">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="p-2 bg-slate-200 rounded-lg text-slate-600"><i class="fa-solid fa-wallet"></i></div>
                            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Resultado</span>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 font-mono text-left break-words w-full leading-none mt-2">${fmt.format(rec - desp)}</p>
                    </div>
                </div>

                <!-- GRÁFICOS PRINCIPAIS -->
                <div class="grid grid-cols-2 gap-8 mb-8">
                    <div class="border border-slate-100 rounded-lg p-4 shadow-sm bg-white">
                        <div class="mb-4 pb-2 border-b border-slate-50 flex items-center justify-between">
                            <h4 class="font-bold text-slate-700 text-sm">Fluxo de Caixa</h4>
                            <span class="text-[10px] text-slate-400 uppercase">Mensal</span>
                        </div>
                        <img src="${imgLine}" class="w-full h-auto object-contain">
                    </div>
                    <div class="border border-slate-100 rounded-lg p-4 shadow-sm bg-white">
                         <div class="mb-4 pb-2 border-b border-slate-50 flex items-center justify-between">
                            <h4 class="font-bold text-slate-700 text-sm">Top Naturezas</h4>
                            <span class="text-[10px] text-slate-400 uppercase">Despesas</span>
                        </div>
                        <img src="${imgTopNat}" class="w-full h-auto object-contain">
                    </div>
                </div>

                <!-- TOP 5 CENTROS DE CUSTO -->
                <div class="mt-4 flex-grow">
                    <h4 class="font-bold text-slate-800 text-lg mb-6 pb-2 border-b border-slate-200 flex items-center gap-2">
                        <i class="fa-solid fa-layer-group text-orange-500"></i> Análise por Centro de Custo
                    </h4>
                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <h5 class="text-xs font-bold text-emerald-600 uppercase mb-3 text-center bg-emerald-50 py-1 rounded">Maiores Receitas</h5>
                            <div class="p-4 border border-emerald-50 rounded-lg">
                                <img src="${imgRecCC}" class="w-full h-auto object-contain">
                            </div>
                        </div>
                        <div>
                            <h5 class="text-xs font-bold text-red-600 uppercase mb-3 text-center bg-red-50 py-1 rounded">Maiores Despesas</h5>
                            <div class="p-4 border border-red-50 rounded-lg">
                                <img src="${imgDespCC}" class="w-full h-auto object-contain">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div class="absolute bottom-8 left-12 right-12 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <div class="flex items-center gap-2">
                         <img src="assets/tecnoit/logo-full.png" class="h-4 grayscale opacity-50">
                         <span>Sistema Financeiro Inteligente</span>
                    </div>
                    <span>Página 1 de 1</span>
                </div>
            </div>
        `;
        document.getElementById('btn-download-pdf').disabled = false;
    },
    downloadPDF: async () => {
        const element = document.getElementById('report-paper');
        const canvas = await html2canvas(element, { scale: 2 });
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
        pdf.save('Relatorio_TecnoIT.pdf');
    }
};

App.init();
