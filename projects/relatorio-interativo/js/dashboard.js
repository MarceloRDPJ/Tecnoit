
const DashboardApp = {
    rawData: [],
    filteredData: [],
    charts: {},
    othersDataCache: [], // Store data for "Outros" drill down
    config: {
        colors: {
            rec: '#10B981',
            desp: '#ef4444',
            text: '#94a3b8',
            grid: 'rgba(255,255,255,0.1)',
            zeroLine: '#fff'
        },
        font: "'Inter', sans-serif"
    },

    init: function(userConfig) {
        this.config = { ...this.config, ...userConfig };

        // Defaults
        Chart.defaults.color = this.config.colors.text;
        Chart.defaults.borderColor = this.config.colors.grid;
        Chart.defaults.font.family = this.config.font;

        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        if(dropZone) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = this.config.colors.highlight || '#00B4D8';
                dropZone.style.transform = 'scale(1.02)';
            });
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                dropZone.style.transform = 'scale(1)';
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                if(e.dataTransfer.files.length) this.processFile(e.dataTransfer.files[0]);
            });
        }

        if(fileInput) {
            fileInput.addEventListener('change', (e) => {
                if(e.target.files.length) this.processFile(e.target.files[0]);
            });
        }
    },

    processFile: async function(file) {
        document.getElementById('loading').classList.remove('hidden');
        try {
            let rows = [];
            if (file.name.endsWith('.csv')) rows = await this.parseCSV(file);
            else rows = await this.parseExcel(file);

            this.rawData = this.cleanDataLogic(rows);
            if (this.rawData.length === 0) throw new Error("Dados inválidos ou vazios.");

            this.initFilters(this.rawData);
            this.applyFilters(); // Triggers render

            document.getElementById('uploadScreen').classList.add('hidden');
            document.getElementById('dashboardContent').classList.remove('hidden');
            document.getElementById('dateDisplay').innerText = new Date().toLocaleDateString();

            // Hide Instructions if visible
            const info = document.getElementById('infoSection');
            if(info) info.classList.add('hidden');

        } catch (err) {
            alert("Erro: " + err.message);
            document.getElementById('loading').classList.add('hidden');
        }
    },

    parseCSV: function(file) { return new Promise((resolve) => Papa.parse(file, { complete: res => resolve(res.data) })); },

    parseExcel: function(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const wb = XLSX.read(e.target.result, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                resolve(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }));
            };
            reader.readAsArrayBuffer(file);
        });
    },

    cleanDataLogic: function(rows) {
        let yearRowIdx = -1, monthRowIdx = -1;
        for(let i=0; i<Math.min(rows.length, 20); i++) {
            const rowStr = JSON.stringify(rows[i]).toUpperCase();
            if (yearRowIdx === -1 && rowStr.match(/202[0-9]/)) yearRowIdx = i;
            if (monthRowIdx === -1 && (rowStr.includes('JANEIRO') || rowStr.includes('DEZEMBRO'))) monthRowIdx = i;
        }
        if (monthRowIdx === -1) monthRowIdx = 4;
        if (yearRowIdx === -1) yearRowIdx = monthRowIdx - 1;

        const dateMap = {};
        const monthMap = { 'JANEIRO':0,'FEVEREIRO':1,'MARÇO':2,'ABRIL':3,'MAIO':4,'JUNHO':5,'JULHO':6,'AGOSTO':7,'SETEMBRO':8,'OUTUBRO':9,'NOVEMBRO':10,'DEZEMBRO':11 };
        let lastYear = new Date().getFullYear();
        const yearRow = rows[yearRowIdx] || [];
        const monthRow = rows[monthRowIdx] || [];

        for(let col=0; col<monthRow.length; col++) {
            let yVal = String(yearRow[col]).trim();
            if(yVal.match(/^\d{4}$/)) lastYear = parseInt(yVal);
            let mVal = String(monthRow[col]).toUpperCase().match(/([A-ZÇ]+)/);
            if(mVal && monthMap.hasOwnProperty(mVal[1])) dateMap[col] = new Date(lastYear, monthMap[mVal[1]], 1);
        }

        let clean = [];
        let currentCat = "Despesa";
        for(let i=monthRowIdx+1; i<rows.length; i++) {
            const row = rows[i];
            if(!row) continue;
            let c0 = String(row[0]||"").trim().toUpperCase();

            if(c0.includes('RECEITA') || c0.includes('RECEBER')) currentCat = 'Receita';
            else if(c0.includes('PAGAR') || c0.includes('DESPESA')) currentCat = 'Despesa';

            let cc = String(row[9]||"").trim();
            if ((!cc || cc.toUpperCase().includes('TOTAL')) && c0.length > 3) cc = c0;

            if(!cc || cc.toUpperCase().includes('TOTAL')) continue;

            for(let col in dateMap) {
                let val = this.parseMoney(row[col]);
                if(val !== 0) clean.push({ cat: currentCat, cc: cc, val: Math.abs(val), realVal: val, date: dateMap[col] });
            }
        }
        return clean;
    },

    parseMoney: function(val) {
        if(typeof val === 'number') return val;
        let str = String(val).replace(/[R$\s]/g, '').trim();
        if(!str) return 0;
        if(str.includes(',') && !str.includes('.')) str = str.replace(',', '.');
        else if(str.includes('.') && str.includes(',')) str = str.replace('.', '').replace(',', '.');
        let f = parseFloat(str);
        return isNaN(f) ? 0 : f;
    },

    initFilters: function(data) {
        if(data.length === 0) return;
        const sortedDates = data.map(d => d.date.getTime()).sort((a,b)=>a-b);
        document.getElementById('filterStartDate').valueAsDate = new Date(sortedDates[0]);
        document.getElementById('filterEndDate').valueAsDate = new Date(sortedDates[sortedDates.length-1]);
    },

    applyFilters: function() {
        const startDate = document.getElementById('filterStartDate').valueAsDate;
        const endDate = document.getElementById('filterEndDate').valueAsDate;
        const category = document.getElementById('filterCategory').value;

        this.filteredData = this.rawData.filter(d => {
            const inDate = (!startDate || d.date >= startDate) && (!endDate || d.date <= endDate);
            const inCat = category === 'all' || d.cat === category;
            return inDate && inCat;
        });

        this.renderDashboard(this.filteredData);
    },

    resetFilters: function() {
        document.getElementById('filterCategory').value = 'all';
        this.initFilters(this.rawData);
        this.applyFilters();
    },

    renderDashboard: function(data) {
        const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

        // Aggregations
        let totalRec = 0, totalDesp = 0;
        const ccStats = {};
        const timeline = {};
        const tornadoStats = {};

        data.forEach(d => {
            const isRec = d.cat === 'Receita';
            if (isRec) totalRec += d.val; else totalDesp += d.val;

            // KPIs & General Stats
            if (!ccStats[d.cc]) ccStats[d.cc] = { rec: 0, desp: 0 };
            if (isRec) ccStats[d.cc].rec += d.val; else ccStats[d.cc].desp += d.val;

            // Timeline
            const tKey = d.date.toLocaleDateString('pt-BR', {month:'short', year:'numeric'});
            if (!timeline[tKey]) timeline[tKey] = { rec: 0, desp: 0, sortDate: d.date };
            if (isRec) timeline[tKey].rec += d.val; else timeline[tKey].desp += d.val;

            // Tornado Data Prep
            if (!tornadoStats[d.cc]) tornadoStats[d.cc] = { rec: 0, desp: 0 };
            if (isRec) tornadoStats[d.cc].rec += d.val; else tornadoStats[d.cc].desp += d.val;
        });

        const saldo = totalRec - totalDesp;

        // Render KPIs
        document.getElementById('kpiReceita').innerText = fmt.format(totalRec);
        document.getElementById('kpiDespesa').innerText = fmt.format(totalDesp);
        const kpiSaldo = document.getElementById('kpiSaldo');
        kpiSaldo.innerText = fmt.format(saldo);
        kpiSaldo.className = `text-3xl font-bold mb-2 ${saldo >= 0 ? 'text-' + (this.config.colors.rec === '#10B981' ? 'vibrantCyan' : 'vibrantCyan') : 'text-red-500'}`;
        // Adjust text color logic slightly based on branding if needed, but keeping standard logic here

        // PREPARE STANDARD CHARTS
        const topDesp = Object.entries(ccStats).map(([n, s]) => ({ n, v: s.desp })).sort((a,b) => b.v - a.v).slice(0, 5);
        const topRec = Object.entries(ccStats).map(([n, s]) => ({ n, v: s.rec })).sort((a,b) => b.v - a.v).slice(0, 5);

        this.updateChart('chartRankDespesa', 'bar', {
            labels: topDesp.map(x => x.n),
            datasets: [{ label: 'Despesa', data: topDesp.map(x => x.v), backgroundColor: this.config.colors.desp, borderRadius: 4 }]
        }, { indexAxis: 'y' });

        this.updateChart('chartRankReceita', 'bar', {
            labels: topRec.map(x => x.n),
            datasets: [{ label: 'Receita', data: topRec.map(x => x.v), backgroundColor: this.config.colors.rec, borderRadius: 4 }]
        }, { indexAxis: 'y' });

        // --- TORNADO CHART LOGIC (Top 20 + Outros) ---

        // 1. Sort by total volume
        const sortedTornado = Object.entries(tornadoStats)
            .map(([n, s]) => ({ n, rec: s.rec, desp: s.desp, volume: s.rec + s.desp }))
            .sort((a, b) => b.volume - a.volume);

        // 2. Slice Top 20
        const top20 = sortedTornado.slice(0, 20);
        const others = sortedTornado.slice(20);

        // 3. Aggregate Others
        let othersItem = null;
        if(others.length > 0) {
            const othersRec = others.reduce((acc, curr) => acc + curr.rec, 0);
            const othersDesp = others.reduce((acc, curr) => acc + curr.desp, 0);
            othersItem = { n: 'Outros (Clique para detalhes)', rec: othersRec, desp: othersDesp, volume: othersRec + othersDesp, isOthers: true };
            top20.push(othersItem);

            // Store details for drill down
            this.othersDataCache = others;
        } else {
            this.othersDataCache = [];
        }

        // 4. Update Container Height (Fixed for Top 20 ~ 21 items)
        // 21 items * 40px = 840px max. But if fewer items, shrink.
        const rowHeight = 40;
        const dynamicHeight = Math.max(500, top20.length * rowHeight);
        document.getElementById('chartVisaoGeral').parentElement.style.height = `${dynamicHeight}px`;

        // 5. Render Tornado
        this.updateChart('chartVisaoGeral', 'bar', {
            labels: top20.map(x => x.n),
            datasets: [
                {
                    label: 'Receitas',
                    data: top20.map(x => x.rec),
                    backgroundColor: this.config.colors.rec,
                    borderRadius: 4,
                    stack: 'Stack 0'
                },
                {
                    label: 'Despesas',
                    data: top20.map(x => -x.desp),
                    backgroundColor: this.config.colors.desp,
                    borderRadius: 4,
                    stack: 'Stack 0'
                }
            ]
        }, {
            indexAxis: 'y',
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: { color: this.config.colors.grid, zeroLineColor: this.config.colors.zeroLine, zeroLineWidth: 2 },
                    ticks: { callback: (val) => fmt.format(Math.abs(val)) }
                },
                y: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { autoSkip: false, font: { size: 11, family: this.config.font } }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.x !== null) label += fmt.format(Math.abs(context.parsed.x));
                            return label;
                        }
                    }
                }
            },
            onClick: (evt, elements) => {
                if(elements.length > 0) {
                    const idx = elements[0].index;
                    const label = top20[idx].n;
                    if(label.includes('Outros') || top20[idx].isOthers) {
                        this.openOthersModal();
                    }
                }
            }
        });

        // PIES & LINE
        const palette = ['#00B4D8', '#F59E0B', '#10B981', '#ef4444', '#8b5cf6', '#ec4899'];
        this.updatePieChart('chartPizzaDespesa', topDesp, totalDesp, palette);
        this.updatePieChart('chartPizzaReceita', topRec, totalRec, palette);

        const sortedTimelineKeys = Object.keys(timeline).sort((a,b) => timeline[a].sortDate - timeline[b].sortDate);
        this.updateChart('chartEvolucao', 'line', {
            labels: sortedTimelineKeys,
            datasets: [
                { label: 'Entradas', data: sortedTimelineKeys.map(k => timeline[k].rec), borderColor: this.config.colors.rec, backgroundColor: this.config.colors.rec, tension: 0.3 },
                { label: 'Saídas', data: sortedTimelineKeys.map(k => timeline[k].desp), borderColor: this.config.colors.desp, backgroundColor: this.config.colors.desp, tension: 0.3 }
            ]
        }, {
            scales: { x: { grid: {display:false} }, y: { grid: {color: this.config.colors.grid} } }
        });
    },

    updateChart: function(id, type, data, extraOptions = {}) {
        if (this.charts[id]) this.charts[id].destroy();
        this.charts[id] = new Chart(document.getElementById(id), {
            type: type, data: data,
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: type !== 'bar', labels: { color: this.config.colors.text } } },
                ...extraOptions
            }
        });
    },

    updatePieChart: function(id, topData, total, colors) {
        let labels = topData.map(x => x.n);
        let values = topData.map(x => x.v);
        const others = total - values.reduce((a,b)=>a+b, 0);
        if(others > 0) { labels.push('Outros'); values.push(others); }

        this.updateChart(id, 'doughnut', {
            labels: labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }]
        }, { cutout: '70%' });
    },

    openOthersModal: function() {
        const modal = document.getElementById('othersModal');
        if(!modal) return;

        modal.classList.remove('hidden');

        // Prepare Data for breakdown
        const others = this.othersDataCache;
        // Sort by Rec and Desp
        const topRec = others.filter(x => x.rec > 0).sort((a,b) => b.rec - a.rec).slice(0, 10);
        const topDesp = others.filter(x => x.desp > 0).sort((a,b) => b.desp - a.desp).slice(0, 10);

        // Render Charts in Modal
        // Wait for modal to be visible
        setTimeout(() => {
            const palette = ['#00B4D8', '#F59E0B', '#10B981', '#ef4444', '#8b5cf6', '#ec4899'];

            // Pie Receitas Breakdown
            this.updateChart('chartOthersRec', 'pie', {
                labels: topRec.map(x => x.n),
                datasets: [{ data: topRec.map(x => x.rec), backgroundColor: palette, borderWidth: 0 }]
            });

            // Pie Despesas Breakdown
            this.updateChart('chartOthersDesp', 'pie', {
                labels: topDesp.map(x => x.n),
                datasets: [{ data: topDesp.map(x => x.desp), backgroundColor: palette, borderWidth: 0 }]
            });
        }, 100);
    },

    closeOthersModal: function() {
        document.getElementById('othersModal').classList.add('hidden');
    },

    toggleInstructions: function() {
        const el = document.getElementById('infoSection');
        if(el) {
            el.classList.toggle('hidden');
            // Scroll to it if opening
            if(!el.classList.contains('hidden')) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    generatePDF: async function() {
        const btn = document.getElementById('btnExport');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Gerando...';
        await new Promise(r => setTimeout(r, 100));
        const element = document.getElementById('dashboardContent');
        try {
            const canvas = await html2canvas(element, {
                scale: 2, backgroundColor: '#020617', useCORS: true, logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Relatorio_RDP_Studio.pdf');
        } catch (e) {
            console.error(e);
            alert('Erro ao gerar PDF.');
        }
        btn.innerHTML = originalHTML;
    }
};

// Global Exposure for HTML onclick handlers
window.DashboardApp = DashboardApp;
window.applyFilters = () => DashboardApp.applyFilters();
window.resetFilters = () => DashboardApp.resetFilters();
window.generatePDF = () => DashboardApp.generatePDF();
window.toggleInstructions = () => DashboardApp.toggleInstructions();
window.closeOthersModal = () => DashboardApp.closeOthersModal();
