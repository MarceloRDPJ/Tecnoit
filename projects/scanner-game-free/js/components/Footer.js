// Footer Component
window.Footer = () => (
    <footer className="mt-20 border-t border-white/10 pt-12 pb-8 bg-darkSlate">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex justify-center gap-8 mb-8">
                <a href="https://instagram.com/marcelo_rpj" target="_blank" className="text-slate-400 hover:text-vibrantCyan transition-colors text-2xl"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://www.linkedin.com/in/marcelo-rodrigues-088478211/" target="_blank" className="text-slate-400 hover:text-vibrantCyan transition-colors text-2xl"><i className="fa-brands fa-linkedin"></i></a>
                <a href="mailto:rdpstudio@gmail.com" className="text-slate-400 hover:text-vibrantCyan transition-colors text-2xl"><i className="fa-regular fa-envelope"></i></a>
            </div>
            <p className="text-sm text-slate-500 mb-2">© 2025 RDP STUDIO. Todos os direitos reservados.</p>
            <p className="text-xs text-slate-600">Desenvolvido por Marcelo Rodrigues</p>
            <div className="mt-4 watermark-container opacity-50 hover:opacity-100 transition-opacity">
                <small className="text-[10px] text-slate-700">RDP INSIDER SYSTEM v3.0</small>
            </div>
        </div>
    </footer>
);
