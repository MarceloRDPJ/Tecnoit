// --- INÍCIO DA LÓGICA DO CARD 3D ---
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.perspective-container');

    containers.forEach(container => {
        const panel = container.querySelector('.glass-panel');
        const glare = container.querySelector('.card-glare');
        const borderGlow = container.querySelector('.card-border-glow');
        const previewWindow = container.querySelector('#card-preview-window');
        const cardContent = container.querySelector('#card-content');
        const title = container.querySelector('#card-title');
        const text = container.querySelector('#card-text');
        const button = container.querySelector('#card-button');

        if (!panel || !glare || !borderGlow || !previewWindow || !cardContent) return;

        // --- Evento de Mover o Mouse ---
        container.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;
            const x = (relativeX - rect.width / 2) / (rect.width / 2);
            const y = (relativeY - rect.height / 2) / (rect.height / 2);

            const maxRotation = 8;
            const rotateX = y * maxRotation;
            const rotateY = -x * maxRotation;
            panel.style.transition = 'transform 0.1s linear';
            panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;

            const titleMaxMove = 10;
            const textMaxMove = 4;
            const buttonMaxMove = 7;
            title.style.transform = `translateZ(50px) translateX(${-x * titleMaxMove}px) translateY(${-y * titleMaxMove}px)`;
            text.style.transform = `translateZ(20px) translateX(${-x * textMaxMove}px) translateY(${-y * textMaxMove}px)`;
            if (button) {
                button.style.transform = `translateZ(35px) translateX(${-x * buttonMaxMove}px) translateY(${-y * buttonMaxMove}px) ${button.matches(':hover') ? 'translateY(-2px)' : ''}`;
            }

            const glareX = x * 50 + 50;
            const glareY = y * 50 + 50;
            glare.style.transition = 'opacity 0.2s ease, background-position 0.1s linear';
            glare.style.backgroundPosition = `${glareX}% ${glareY}%`;

            borderGlow.style.transition = 'opacity 0.2s ease, background-position 0.1s linear';
            borderGlow.style.backgroundPosition = `${relativeX - 200}px ${relativeY - 200}px`;

            const bgMaxMove = 10;
            const bgPosX = 50 + (-x * bgMaxMove);
            const bgPosY = 50 + (-y * bgMaxMove);
            previewWindow.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        });

        // --- Evento de Entrar no Card ---
        container.addEventListener('mouseenter', () => {
            panel.style.boxShadow = '0 40px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(234, 88, 12, 0.3)';
            glare.style.opacity = '1';
            borderGlow.style.opacity = '1';

            [title, text, button].forEach(el => { if (el) el.style.transition = 'transform 0.1s linear' });
            previewWindow.style.transition = 'opacity 0.4s ease-in-out, background-position 0.1s linear, transform 0.1s linear';
        });

        // --- Evento de Sair do Card ---
        container.addEventListener('mouseleave', () => {
            panel.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.320, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.320, 1)';
            panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            panel.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';

            glare.style.transition = 'opacity 0.5s ease, background-position 0.5s ease';
            glare.style.opacity = '0';
            glare.style.backgroundPosition = '-100% -100%';

            borderGlow.style.transition = 'opacity 0.5s ease, background-position 0.5s ease';
            borderGlow.style.opacity = '0';
            borderGlow.style.backgroundPosition = '-500px -500px';

            cardContent.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.320, 1), opacity 0.4s ease';
            cardContent.style.opacity = '1';
            cardContent.style.transform = 'translateZ(0px)';

            const slowTransition = 'transform 0.5s cubic-bezier(0.23, 1, 0.320, 1)';
            title.style.transition = slowTransition;
            title.style.transform = 'translateZ(50px) translateX(0px) translateY(0px)';
            text.style.transition = slowTransition;
            text.style.transform = 'translateZ(20px) translateX(0px) translateY(0px)';
            if (button) {
                button.style.transition = `all 0.4s ease, ${slowTransition}`;
                button.style.transform = 'translateZ(35px) translateX(0px) translateY(0px)';
            }

            previewWindow.style.transition = 'opacity 0.3s ease-out, background-position 0.5s cubic-bezier(0.23, 1, 0.320, 1)';
            previewWindow.style.opacity = '0';
            previewWindow.style.backgroundPosition = 'center center';
        });
    });
});
// --- FIM DA LÓGICA DO CARD 3D ---
