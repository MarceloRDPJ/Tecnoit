// Epic Dashboard Component
window.EpicDashboard = ({ epicData, newsItems }) => {
    const Icon = window.Icon;
    const Badge = window.Badge;
    const { current_games, upcoming_games, mystery_detected, status, latency } = epicData || { current_games: [] };

    // Mock Logs for the "API Analysis" visual
    const [logs, setLogs] = React.useState([
        "> Conectando ao endpoint seguro...",
        "> Handshake estabelecido.",
        "> Recebendo pacote de dados...",
        "> Descriptografando...",
        "> Análise de integridade: OK"
    ]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            const newLog = `> [${new Date().toLocaleTimeString()}] Ping ${Math.floor(Math.random() * 50) + 10}ms - OK`;
            setLogs(prev => [newLog, ...prev].slice(0, 6));
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Countdown Component
    const Countdown = ({ date }) => {
        const target = new Date(date).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

        return (
            <div className="text-xs font-mono text-slate-400 mt-2">
               <Icon name="clock" className="mr-1" /> Expira em <span className="text-white font-bold">{daysLeft} dias</span>
            </div>
        )
    };

    return (
        <div className="animate-fade-in space-y-8">

            {/* STATUS BAR & API ANALYSIS */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-vibrantCyan">
                 <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-vibrantCyan/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            <Icon name="server" className="text-xl text-vibrantCyan relative z-10" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Epic Store API Node</h3>
                            <div className="text-xs text-slate-400 font-mono flex gap-4 mt-1">
                                <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full animate-pulse ${status === 'Offline' ? 'bg-dangerRed' : 'bg-trustGreen'}`}></span> {status}</span>
                                <span>LATENCY: {latency}</span>
                                <span>UPTIME: 99.9%</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Traffic Graph (CSS only) */}
                    <div className="hidden md:flex items-end gap-1 h-8 w-32">
                        {[40, 70, 45, 90, 60, 30, 80, 50].map((h, i) => (
                            <div key={i} className="w-full bg-vibrantCyan/20 rounded-t-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>

                    {mystery_detected && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-mysteryPurple/20 border border-mysteryPurple/50 rounded-full animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                            <Icon name="mask" className="text-mysteryPurple" />
                            <span className="text-sm font-bold text-mysteryPurple uppercase tracking-widest">Mistério Detectado</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* LEFT COLUMN: CURRENT GAMES */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icon name="gift" className="text-vibrantCyan" /> Jogo Grátis da Semana
                    </h2>

                    {current_games.length > 0 ? current_games.map((game, idx) => (
                        <div key={idx} className="glass-panel rounded-2xl overflow-hidden border border-white/10 group relative">
                            <div className="h-64 overflow-hidden relative">
                                <img src={game.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-darkSlate via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-vibrantCyan text-darkSlate text-xs font-bold px-3 py-1 rounded-full uppercase">Grátis agora</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{game.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-500 font-mono">
                                        <span className="line-through mr-2 text-dangerRed">{game.price === '0' ? '$29.99' : game.price}</span>
                                        <span className="text-trustGreen font-bold">GRÁTIS</span>
                                        <Countdown date={game.end_date} />
                                    </div>
                                    <a href={game.url} target="_blank" className="px-6 py-2 bg-white text-darkSlate font-bold rounded-lg hover:bg-vibrantCyan transition-colors">
                                        Resgatar <Icon name="arrow-up-right-from-square" className="ml-1 text-xs" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 glass-panel rounded-xl text-center text-slate-500">
                            <Icon name="ghost" className="text-3xl mb-2" />
                            <p>Nenhum jogo grátis detectado no momento.</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: UPCOMING & MYSTERY */}
                <div className="space-y-6">

                    {/* MYSTERY CARD */}
                    {mystery_detected && (
                        <div className="glass-panel rounded-xl p-1 border border-mysteryPurple/50 shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-mysteryPurple/5 group-hover:bg-mysteryPurple/10 transition-colors"></div>
                            <div className="p-6 relative z-10 text-center">
                                <Icon name="user-secret" className="text-4xl text-mysteryPurple mb-3 animate-bounce" />
                                <h3 className="text-xl font-bold text-white mb-1">Evento de Mistério</h3>
                                <p className="text-xs text-slate-400 mb-4">A Epic Games preparou algo grande. Fique atento às 13h.</p>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-mysteryPurple w-3/4 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* UPCOMING LIST */}
                    <div className="glass-panel rounded-xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            Em Breve
                        </h3>
                        <div className="space-y-4">
                            {upcoming_games && upcoming_games.map((game, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                        <img src={game.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate group-hover:text-vibrantCyan transition-colors">{game.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{game.description}</p>
                                        <div className="mt-1 text-[10px] text-trustGreen font-mono bg-trustGreen/10 inline-block px-1.5 rounded">
                                            {new Date(game.start_date).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RAW DATA TERMINAL */}
                    <div className="glass-panel rounded-xl p-4 bg-black/40 font-mono text-[10px] text-slate-500 overflow-hidden border border-white/5">
                        <div className="flex justify-between items-center mb-2 text-xs text-slate-400 border-b border-white/5 pb-2">
                            <span className="flex items-center gap-2"><Icon name="terminal" className="text-vibrantCyan" /> SECURITY_LOG_V3.0</span>
                            <span className="text-[10px] text-trustGreen">ENCRYPTED</span>
                        </div>
                        <div className="space-y-1 font-mono text-slate-400 h-24 overflow-hidden relative">
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                            {logs.map((log, i) => (
                                <p key={i} className="truncate border-l-2 border-transparent hover:border-vibrantCyan pl-2 transition-colors">
                                    {log}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* INTERCEPTED INTELLIGENCE SECTION */}
            <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Icon name="user-secret" className="text-energeticAmber" />
                        Inteligência Interceptada
                        <span className="text-xs bg-energeticAmber/20 text-energeticAmber px-2 py-1 rounded border border-energeticAmber/30">CONFIDENTIAL</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {newsItems && newsItems.length > 0 ? (
                        newsItems.map((item, idx) => (
                            <a href={item.url} target="_blank" key={idx} className="block glass-panel p-5 rounded-xl border border-white/5 hover:border-energeticAmber/50 transition-all group hover:bg-white/5">
                                <div className="flex items-start justify-between mb-3">
                                    <Badge type={item.category} />
                                    <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-energeticAmber transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                                    {item.summary}
                                </p>
                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Icon name="tower-broadcast" /> {item.sources[0]}
                                    </span>
                                    {item.reliability && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            item.reliability === 'High' ? 'text-trustGreen bg-trustGreen/10' :
                                            item.reliability === 'Medium' ? 'text-energeticAmber bg-energeticAmber/10' :
                                            'text-dangerRed bg-dangerRed/10'
                                        }`}>
                                            {item.reliability.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 text-slate-600">
                            <Icon name="shield-cat" className="text-2xl mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma inteligência interceptada no momento.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
