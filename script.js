document.addEventListener('DOMContentLoaded', () => {
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownWrapper = document.getElementById('toolsDropdown');

    if (dropdownBtn && dropdownMenu && dropdownWrapper) {
        // Toggle abrir / cerrar al hacer clic en el botón "Herramientas"
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownMenu.classList.contains('show');
            
            dropdownMenu.classList.toggle('show');
            dropdownWrapper.classList.toggle('active');
            dropdownBtn.setAttribute('aria-expanded', !isOpen);
        });

        // Cerrar menú al hacer clic en cualquier opción interna
        const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                dropdownWrapper.classList.remove('active');
                dropdownBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar el menú al hacer clic en cualquier parte fuera del menú
        document.addEventListener('click', (e) => {
            if (!dropdownWrapper.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                dropdownWrapper.classList.remove('active');
                dropdownBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});