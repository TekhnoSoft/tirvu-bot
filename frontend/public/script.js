document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', function() {
      preloader.classList.add('hidden');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    });
  
    // Cursor Follower
    const cursor = document.querySelector('.cursor-follower');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
    });
    
    document.addEventListener('mouseenter', function() {
      cursor.style.opacity = 1;
    });
    
    document.addEventListener('mouseleave', function() {
      cursor.style.opacity = 0;
    });
    
    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .feature-card, .pricing-card, .faq-question');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', function() {
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1.5)`;
        cursor.style.backgroundColor = 'rgba(1, 206, 124, 0.1)';
      });
      el.addEventListener('mouseleave', function() {
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
        cursor.style.backgroundColor = 'rgba(1, 206, 124, 0.2)';
      });
    });
  
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const headerButtons = document.querySelector('.header-buttons');
    
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      
      if (mainNav.style.display === 'flex') {
        mainNav.style.display = 'none';
        headerButtons.style.display = 'none';
      } else {
        mainNav.style.display = 'flex';
        headerButtons.style.display = 'flex';
        mainNav.style.flexDirection = 'column';
        headerButtons.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        headerButtons.style.position = 'absolute';
        mainNav.style.top = '80px';
        headerButtons.style.top = `${80 + mainNav.offsetHeight}px`;
        mainNav.style.left = '0';
        headerButtons.style.left = '0';
        mainNav.style.width = '100%';
        headerButtons.style.width = '100%';
        mainNav.style.backgroundColor = 'var(--white)';
        headerButtons.style.backgroundColor = 'var(--white)';
        mainNav.style.padding = '1rem';
        headerButtons.style.padding = '1rem';
        mainNav.style.boxShadow = 'var(--shadow)';
        headerButtons.style.boxShadow = 'var(--shadow)';
      }
    });
  
    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  
    // Initialize AOS (Animate on Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  
    // Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-count'));
      const duration = 2000;
      const step = target / duration * 10;
      let current = 0;
      
      const timer = setInterval(function() {
        current += step;
        if (current >= target) {
          clearInterval(timer);
          current = target;
        }
        
        // Format numbers with commas
        el.textContent = Math.floor(current).toLocaleString();
      }, 10);
    }
    
    // Start counter animation when elements are in viewport
    const observerOptions = {
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
      observer.observe(stat);
    });
  
    // Pricing Toggle
    const billingToggle = document.getElementById('billing-toggle');
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const annuallyPrices = document.querySelectorAll('.price.annually');
    
    billingToggle.addEventListener('change', function() {
      if (this.checked) {
        monthlyPrices.forEach(price => price.style.display = 'none');
        annuallyPrices.forEach(price => price.style.display = 'flex');
      } else {
        monthlyPrices.forEach(price => price.style.display = 'flex');
        annuallyPrices.forEach(price => price.style.display = 'none');
      }
    });
  
    // Testimonial Slider
    const testimonialSlider = document.querySelector('.testimonials-slider');
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.testimonial-prev');
    const nextButton = document.querySelector('.testimonial-next');
    let currentSlide = 0;
    
    function showSlide(index) {
      testimonialSlider.style.transform = `translateX(-${index * 100}%)`;
      
      testimonialDots.forEach(dot => dot.classList.remove('active'));
      testimonialDots[index].classList.add('active');
    }
    
    testimonialDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
    
    prevButton.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
      showSlide(currentSlide);
    });
    
    nextButton.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % testimonialSlides.length;
      showSlide(currentSlide);
    });
    
    // Auto slide testimonials
    let testimonialInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % testimonialSlides.length;
      showSlide(currentSlide);
    }, 5000);
    
    // Pause auto slide on hover
    testimonialSlider.addEventListener('mouseenter', () => {
      clearInterval(testimonialInterval);
    });
    
    testimonialSlider.addEventListener('mouseleave', () => {
      testimonialInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
      }, 5000);
    });
  
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        faqItems.forEach(faqItem => {
          faqItem.classList.remove('active');
          faqItem.querySelector('.faq-answer').style.display = 'none';
          faqItem.querySelector('.faq-toggle i').className = 'fas fa-plus';
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
          item.classList.add('active');
          answer.style.display = 'block';
          item.querySelector('.faq-toggle i').className = 'fas fa-minus';
        }
      });
    });
  
    // Back to Top Button
    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (mobileMenuToggle.classList.contains('active')) {
              mobileMenuToggle.click();
            }
          }
        }
      });
    });
  
    // Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        // Simple validation
        if (email && email.includes('@') && email.includes('.')) {
          // Simulate form submission
          this.innerHTML = '<p class="success-message">Obrigado por se inscrever! 🎉</p>';
        } else {
          emailInput.style.borderColor = 'var(--danger)';
          
          const errorMessage = document.createElement('p');
          errorMessage.className = 'error-message';
          errorMessage.textContent = 'Por favor, insira um email válido.';
          errorMessage.style.color = 'var(--danger)';
          errorMessage.style.fontSize = '0.75rem';
          errorMessage.style.marginTop = '0.5rem';
          
          // Remove any existing error message
          const existingError = this.querySelector('.error-message');
          if (existingError) {
            existingError.remove();
          }
          
          this.querySelector('.form-group').appendChild(errorMessage);
        }
      });
    }
  });