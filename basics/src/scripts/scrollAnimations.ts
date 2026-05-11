// Minimal scroll animations
export function initScrollAnimations() {
	// Intersection Observer for fade-in
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate-visible');
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
	);

	document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));

	// Smooth scroll for anchor links
	document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', (e) => {
			const href = anchor.getAttribute('href');
			if (!href || href === '#') return;
			const target = document.querySelector(href);
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});

	// Scroll progress bar
	const progressBar = document.createElement('div');
	progressBar.className = 'scroll-progress';
	progressBar.setAttribute('aria-hidden', 'true');
	document.body.appendChild(progressBar);

	let ticking = false;
	window.addEventListener('scroll', () => {
		if (!ticking) {
			requestAnimationFrame(() => {
				const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
				progressBar.style.width = `${(window.pageYOffset / h) * 100}%`;
				ticking = false;
			});
			ticking = true;
		}
	});
}

// Init
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
	initScrollAnimations();
}
