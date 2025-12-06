const nav = document.getElementById('bottom-nav');
const scrollContainer = document.getElementById('scroll-container');
let lastScrollY = 0;

if (scrollContainer && nav) {
    scrollContainer.addEventListener('scroll', () => {
        const currentScrollY = scrollContainer.scrollTop;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            nav.classList.add('translate-y-full');
        } else {
            nav.classList.remove('translate-y-full');
        }
        lastScrollY = currentScrollY;
    });
}