// Main App Logic
function App() {
    const Icon = window.Icon;
    const NavBar = window.NavBar;
    const Footer = window.Footer;
    const EpicDashboard = window.EpicDashboard;
    const NewsCard = window.NewsCard;

    const [data, setData] = React.useState(null);
    const [filter, setFilter] = React.useState('All');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Fetch DB
        fetch('data/db.json')
            .then(res => res.json())
            .then(jsonData => {
                // Check freshness client-side as well
                const lastUpdated = new Date(jsonData.last_updated);
                const now = new Date();
                const hoursSinceUpdate = Math.abs(now - lastUpdated) / 36e5;

                if (hoursSinceUpdate > 48) {
                    jsonData.status = "Outdated";
                } else if (hoursSinceUpdate > 24) {
                    jsonData.status = "Warning";
                }

                setData(jsonData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load DB", err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-vibrantCyan">
            <Icon name="circle-notch" className="text-4xl animate-spin" />
        </div>
    );

    // Fallback if data fetch failed completely (e.g. 404)
    if (!data) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-slate-400">
            <Icon name="triangle-exclamation" className="text-4xl mb-4 text-dangerRed" />
            <h1 className="text-2xl font-bold text-white mb-2">Sistema Offline</h1>
            <p>Falha ao conectar com o banco de dados de inteligência.</p>
            <p className="text-xs mt-2 font-mono text-slate-600">ERROR_CODE: DB_FETCH_FAILED</p>
        </div>
    );

    // Filter Logic
    const categories = ['All', 'Epic Dashboard', 'Rumor', 'Hardware', 'Free Games', 'Release Date'];

    // Logic to switch view
    const isEpicView = filter === 'Epic Dashboard';

    // For standard grid
    const filteredItems = filter === 'All'
        ? data.items
        : data.items.filter(item => item.category === filter);

    // For Epic Dashboard news feed
    const epicNewsItems = data.items.filter(item =>
        item.category === 'Epic Mystery' ||
        item.category === 'Epic News' ||
        item.category === 'Rumor' ||
        item.title.toLowerCase().includes('epic') ||
        (item.category === 'Hardware' && item.reliability === 'High')
    );

    return (
        <div className="flex-grow flex flex-col font-sans">
            <NavBar lastUpdate={data.display_date} status={data.status} />

            <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">

                {/* CONTROLS */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Icon name={isEpicView ? "gamepad" : "layer-group"} className="text-vibrantCyan" />
                        {isEpicView ? "Epic Games Intelligence" : "Feed de Inteligência"}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                    filter === cat
                                        ? 'bg-vibrantCyan text-darkSlate border-vibrantCyan shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                {cat === 'Epic Dashboard' && <Icon name="mask" className="mr-1" />}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* VIEW SWITCHER */}
                {isEpicView ? (
                    <EpicDashboard epicData={data.epic_data} newsItems={epicNewsItems} />
                ) : (
                    /* STANDARD GRID VIEW */
                    <>
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                <Icon name="wind" className="text-4xl mb-4 opacity-50" />
                                <p>Nenhum dado encontrado para esta categoria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {filteredItems.map((item, index) => (
                                    <NewsCard key={item.id || index} item={item} />
                                ))}
                            </div>
                        )}
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
