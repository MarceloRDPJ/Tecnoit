// Badge Component
window.Badge = ({ type }) => {
    const styles = {
        'Rumor': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Confirmed': 'bg-trustGreen/20 text-trustGreen border-trustGreen/30',
        'Free Games': 'bg-vibrantCyan/20 text-vibrantCyan border-vibrantCyan/30',
        'Hardware': 'bg-energeticAmber/20 text-energeticAmber border-energeticAmber/30',
        'Release Date': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Epic Mystery': 'bg-mysteryPurple/20 text-mysteryPurple border-mysteryPurple/30 shadow-[0_0_10px_rgba(139,92,246,0.3)]',
        'Epic News': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        'News': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        'High': 'text-trustGreen',
        'Medium': 'text-energeticAmber',
        'Low': 'text-dangerRed'
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[type] || 'bg-slate-700 text-slate-300'}`}>
            {type === 'Epic Mystery' && <window.Icon name="mask" className="mr-1" />}
            {type}
        </span>
    );
};
