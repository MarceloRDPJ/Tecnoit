// NewsCard Component
window.NewsCard = ({ item }) => {
    const Icon = window.Icon;
    const Badge = window.Badge;

    const handleImageError = (e) => {
        e.target.src = "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80";
        e.target.onerror = null;
    };

    return (
        <a href={item.url} target="_blank" className="glass-panel rounded-xl overflow-hidden hover-card transition-all duration-300 flex flex-col h-full group block">
            <div className="h-48 overflow-hidden relative">
                <img
                    src={item.image}
                    alt={item.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-3 right-3">
                    <Badge type={item.category} />
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white leading-snug mb-3 line-clamp-2 group-hover:text-vibrantCyan transition-colors">
                    {item.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1">
                    {item.summary}
                </p>

                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end mb-2 text-xs font-mono text-slate-500">
                        <span>{item.source_count} Fontes</span>
                        <span className="flex items-center gap-1">
                            {item.reliability}
                            <Icon name={item.reliability === 'High' ? 'circle-check' : 'triangle-exclamation'}
                                  className={item.reliability === 'High' ? 'text-trustGreen' : 'text-energeticAmber'} />
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                         <div className={`h-full ${item.reliability === 'High' ? 'bg-trustGreen' : item.reliability === 'Medium' ? 'bg-energeticAmber' : 'bg-dangerRed'} transition-all duration-500`} style={{width: item.reliability === 'High' ? '100%' : item.reliability === 'Medium' ? '66%' : '33%'}}></div>
                    </div>
                </div>
            </div>
        </a>
    );
};
