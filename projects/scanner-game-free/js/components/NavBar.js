// NavBar Component
window.NavBar = ({ lastUpdate, status }) => {
    const Icon = window.Icon;

    // Determine status color
    let statusColor = "text-trustGreen";
    let statusText = "ONLINE";
    let statusBg = "bg-trustGreen/10 border-trustGreen/20";

    if (status === "Partial Outage" || status === "Warning") {
        statusColor = "text-energeticAmber";
        statusText = "WARNING";
        statusBg = "bg-energeticAmber/10 border-energeticAmber/20";
    } else if (status === "Offline" || status === "Outdated") {
        statusColor = "text-dangerRed";
        statusText = "OFFLINE";
        statusBg = "bg-dangerRed/10 border-dangerRed/20";
    }

    return (
        <nav className="sticky top-0 z-50 glass-panel border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <a href="../../index.html" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-vibrantCyan/50 transition-colors">
                            <Icon name="arrow-left" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide uppercase hidden md:block">Voltar ao Hub</span>
                    </a>
                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <Icon name="radar" className="text-vibrantCyan animate-pulse-slow" />
                        <span className="text-lg font-bold tracking-tight text-white">RDP <span className="text-vibrantCyan">INSIDER</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="hidden md:inline"><span className="text-slate-600">LAST SCAN:</span> {lastUpdate}</span>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBg} ${statusColor}`}>
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor.replace('text-', 'bg-')}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor.replace('text-', 'bg-')}`}></span>
                        </span>
                        {statusText}
                    </div>
                </div>
            </div>
        </nav>
    );
};
