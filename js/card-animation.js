
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.perspective-container');

    containers.forEach(container => {
        const panel = container.querySelector('.glass-panel');
        const glare = container.querySelector('.card-glare');

        if (!panel || !glare) return;

        // --- Evento de Mover o Mouse ---
        container.addEventListener('mousemove', (e) => {
            // Pega as dimensões e posição do card
            const rect = panel.getBoundingClientRect();

            // Calcula a posição do mouse (de -0.5 a 0.5)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            // Define a rotação máxima (em graus)
            const maxRotation = 8;

            // Calcula a rotação
            const rotateX = y * maxRotation;
            const rotateY = -x * maxRotation; // Invertido para movimento natural

            // Calcula a posição do brilho (de 0% a 100%)
            const glareX = x * 50 + 50;
            const glareY = y * 50 + 50;

            // Aplica a transformação 3D e o brilho
            // Usamos uma transição linear rápida para suavizar o "tremido"
            panel.style.transition = 'transform 0.1s linear';
            panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;

            glare.style.transition = 'opacity 0.2s ease, background-position 0.1s linear';
            glare.style.backgroundPosition = `${glareX}% ${glareY}%`;
        });

        // --- Evento de Entrar no Card ---
        container.addEventListener('mouseenter', () => {
            const panel = container.querySelector('.glass-panel');
            const glare = container.querySelector('.card-glare');

            panel.style.boxShadow = '0 40px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(234, 88, 12, 0.3)';
            glare.style.opacity = '1';
        });

        // --- Evento de Sair do Card ---
        container.addEventListener('mouseleave', () => {
            const panel = container.querySelector('.glass-panel');
            const glare = container.querySelector('.card-glare');

            // Reseta para a posição original com a transição suave definida no CSS
            panel.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.320, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.320, 1)';
            panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            panel.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.8)';

            // Esconde o brilho
            glare.style.transition = 'opacity 0.5s ease, background-position 0.5s ease';
            glare.style.opacity = '0';
            glare.style.backgroundPosition = '-100% -100%'; // Move para longe
        });
    });
});
