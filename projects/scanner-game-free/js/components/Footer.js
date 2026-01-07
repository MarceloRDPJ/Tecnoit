// Footer Component
window.Footer = () => (
    <footer className="border-t border-slate-800/50 pt-12 pb-8 mt-auto bg-darkSlate">
        <div className="flex flex-col items-center text-center">
            <div className="flex justify-center gap-8 mb-8">
                <a href="https://instagram.com/marcelo_rpj" target="_blank" aria-label="Instagram" className="text-slate-400 hover:text-vibrantCyan transition-colors text-2xl transform hover:scale-110 duration-200">
                    <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://www.linkedin.com/in/marcelo-rodrigues-088478211/" target="_blank" aria-label="LinkedIn" className="text-slate-400 hover:text-vibrantCyan transition-colors text-2xl transform hover:scale-110 duration-200">
                    <i className="fa-brands fa-linkedin"></i>
                </a>
                <a href="mailto:rdpstudio@gmail.com" aria-label="Email" className="text-slate-400 hover:text-vibrantCyan transition-colors text-2xl transform hover:scale-110 duration-200">
                    <i className="fa-regular fa-envelope"></i>
                </a>
            </div>
            <p className="text-sm text-slate-500 mb-2">
                © 2025 RDP STUDIO. Todos os direitos reservados.
            </p>
            <p className="text-xs text-slate-600 font-mono">
                Desenvolvido com <i className="fa-solid fa-heart text-red-900 animate-pulse"></i> por Marcelo Rodrigues
            </p>
            <div className="watermark-container hidden"></div>
        </div>
    </footer>
);
