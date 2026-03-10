/* ============================================================
   Navigation
   ============================================================ */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

// Sticky nav on scroll
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ============================================================
   Active nav link on scroll (IntersectionObserver)
   ============================================================ */
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   Fade-up on scroll
   ============================================================ */
const fadeTargets = [
  '.hero__badge',
  '.hero__title',
  '.hero__subtitle',
  '.hero__actions',
  '.section-header',
  '.about__image-wrap',
  '.about__content',
  '.skill-card',
  '.skills__bars',
  '.project-card',
  '.contact__info',
  '.contact__form',
];

fadeTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('fade-up');
    // Stagger siblings
    if (el.closest('.skills__grid, .projects__grid')) {
      el.style.transitionDelay = `${i * 80}ms`;
    }
  });
});

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ============================================================
   Skill bars — animate when visible
   ============================================================ */
const skillBars = document.querySelectorAll('.skill-bar');

const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const level = entry.target.dataset.level;
        entry.target.querySelector('.skill-bar__fill').style.width = `${level}%`;
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
skillBars.forEach(bar => barObserver.observe(bar));

/* ============================================================
   Project filtering
   ============================================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');

    const filter = btn.dataset.filter;

    projectCards.forEach((card, i) => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden-card');
        // Re-stagger visible cards
        const visibleCards = [...projectCards].filter(c => !c.classList.contains('hidden-card'));
        const idx = visibleCards.indexOf(card);
        card.style.transitionDelay = `${idx * 60}ms`;
      } else {
        card.classList.add('hidden-card');
      }
    });
  });
});

/* ============================================================
   Contact form — client-side validation + mock submit
   ============================================================ */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const formSuccess = document.getElementById('formSuccess');

const fields = {
  name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
  email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
  subject: { el: document.getElementById('subject'), error: document.getElementById('subjectError') },
  message: { el: document.getElementById('message'), error: document.getElementById('messageError') },
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateField(key) {
  const { el, error } = fields[key];
  const val = el.value.trim();

  if (!val) {
    error.textContent = 'This field is required.';
    el.classList.add('error');
    return false;
  }
  if (key === 'email' && !validateEmail(val)) {
    error.textContent = 'Please enter a valid email address.';
    el.classList.add('error');
    return false;
  }
  if (key === 'message' && val.length < 20) {
    error.textContent = 'Message must be at least 20 characters.';
    el.classList.add('error');
    return false;
  }

  error.textContent = '';
  el.classList.remove('error');
  return true;
}

// Live validation on blur
Object.keys(fields).forEach(key => {
  fields[key].el.addEventListener('blur', () => validateField(key));
  fields[key].el.addEventListener('input', () => {
    if (fields[key].el.classList.contains('error')) validateField(key);
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const valid = Object.keys(fields).map(validateField).every(Boolean);
  if (!valid) return;

  // Show loading state
  submitText.textContent = 'Sending…';
  submitSpinner.classList.remove('hidden');
  submitBtn.disabled = true;

  // Simulate network request (replace with actual fetch in production)
  await new Promise(resolve => setTimeout(resolve, 1600));

  // Success state
  submitText.textContent = 'Send Message';
  submitSpinner.classList.add('hidden');
  submitBtn.disabled = false;
  formSuccess.classList.remove('hidden');
  form.reset();

  // Hide success message after 6 seconds
  setTimeout(() => formSuccess.classList.add('hidden'), 6000);
});

/* ============================================================
   Back to top
   ============================================================ */
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   Smooth scroll for all anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});
