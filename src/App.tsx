import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  X,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Mail,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  Phone,
  Layout,
  ExternalLink,
  XCircle,
} from 'lucide-react';

// --- CUSTOM HOOKS & UTILITIES ---

// Scroll Animations Hook
const useOnScreen = (rootMargin = '0px', once = true) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        }
      },
      { rootMargin }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [rootMargin, once]);

  return [ref, isVisible];
};

// Number Increment Animation Component
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useOnScreen('0px', true);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    // Ensure end is treated as a string for regex
    const endValue = parseInt(String(end).replace(/,/g, ''), 10);
    const step = Math.ceil(endValue / 100);

    const timer = setInterval(() => {
      start += step;
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {typeof end === 'number' && end % 1 !== 0
        ? end.toFixed(1) // Keep decimals for 4.9, etc.
        : count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Scroll Fade-In Component
const ScrollFadeIn = ({ children, delay = '0ms', className = '' }) => {
  const [ref, isVisible] = useOnScreen('-50px');
  const animationClass = isVisible
    ? `opacity-100 translate-y-0 scale-100`
    : `opacity-0 translate-y-12 scale-95`;

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${animationClass} ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, center = true }) => (
  <div className={`mb-16 ${center ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading tracking-tight drop-shadow-lg">
      {title}
    </h2>
    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-body leading-relaxed">
      {subtitle}
    </p>
    <div
      className={`h-1 w-24 bg-gradient-to-r from-cyan-500 to-violet-500 mt-8 rounded-full ${center ? 'mx-auto' : ''}`}
    ></div>
  </div>
);

// --- ANIMATED WIREFRAME BACKGROUND ---
const WireframeMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let points = [];
    let rotation = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createSphere = (radius, count) => {
      const pts = [];
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = phi * i;
        pts.push({
          x: Math.cos(theta) * r * radius,
          y: y * radius,
          z: Math.sin(theta) * r * radius,
        });
      }
      return pts;
    };

    points = createSphere(Math.min(width, height) * 0.4, 200);

    const animate = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      rotation += 0.002;

      const cx = width / 2;
      const cy = height / 2;

      // 3D Rotation
      const rotatedPoints = points.map(p => {
        const x1 = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
        const z1 = p.z * Math.cos(rotation) + p.x * Math.sin(rotation);
        const y2 =
          p.y * Math.cos(rotation * 0.5) - z1 * Math.sin(rotation * 0.5);
        const z2 =
          z1 * Math.cos(rotation * 0.5) + p.y * Math.sin(rotation * 0.5);

        return { x: x1, y: y2, z: z2 };
      });

      // Draw Connections (Wireframe)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      for (let i = 0; i < rotatedPoints.length; i++) {
        const p1 = rotatedPoints[i];
        for (let j = i + 1; j < rotatedPoints.length; j++) {
          const p2 = rotatedPoints[j];
          const dist =
            (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2;
          if (dist < 4000) {
            const scale1 = 400 / (400 + p1.z);
            const scale2 = 400 / (400 + p2.z);
            ctx.moveTo(cx + p1.x * scale1, cy + p1.y * scale1);
            ctx.lineTo(cx + p2.x * scale2, cy + p2.y * scale2);
          }
        }
      }
      ctx.stroke();

      // Draw Points
      rotatedPoints.forEach(p => {
        const scale = 400 / (400 + p.z);
        const alpha = (p.z + 200) / 400;
        ctx.beginPath();
        ctx.arc(cx + p.x * scale, cy + p.y * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${Math.max(0.1, alpha)})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
    />
  );
};

// --- CLIENT MARQUEE COMPONENT (FIXED) ---

const ClientMarquee = () => {
  const clients = [
    'Aura Interiors',
    'Luxe & Co. Salon',
    'Zenith Corp',
    'Velocity Freight',
    'Blue Mountain Coffee',
    'The Data Nexus',
    'Apollo Gyms',
    'Skyline Legal',
    'Global Finance Group',
    'Evergreen Estates',
  ];

  return (
    <section className="py-12 bg-slate-900 border-t border-b border-slate-800 overflow-hidden relative z-20">
      {/* Standard CSS style tag for the animation */}
      <style>
        {`
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-infinite {
            display: flex;
            width: fit-content;
            animation: marquee-scroll 40s linear infinite;
          }
          .animate-marquee-infinite:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="w-full overflow-hidden">
        <div className="animate-marquee-infinite">
          {/* Original List */}
          {clients.map((client, index) => (
            <div
              key={`original-${index}`}
              className="flex items-center mx-12 whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-3xl md:text-4xl font-extrabold text-slate-700 font-heading">
                {client}
              </span>
            </div>
          ))}
          {/* Duplicate List for seamless loop */}
          {clients.map((client, index) => (
            <div
              key={`duplicate-${index}`}
              className="flex items-center mx-12 whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-3xl md:text-4xl font-extrabold text-slate-700 font-heading">
                {client}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CORE LAYOUT COMPONENTS ---

const Header = ({ scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Services', id: 'services' },
    { name: 'Work', id: 'work' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'FAQ', id: 'faq' },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
          
          .font-heading { font-family: 'Space Grotesk', sans-serif; }
          .font-body { font-family: 'IBM Plex Sans', sans-serif; }
          
          .text-gradient {
            background: linear-gradient(to right, #22d3ee, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .bg-gradient-primary {
            background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
          }
          html { scroll-behavior: smooth; }

          /* Custom scrollbar for mock website modal */
          .custom-scroll-y::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scroll-y::-webkit-scrollbar-track {
            background: #1e293b; /* slate-800 */
          }
          .custom-scroll-y::-webkit-scrollbar-thumb {
            background: #64748b; /* slate-500 */
            border-radius: 4px;
          }
          .custom-scroll-y::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; /* slate-400 */
          }
        `}
      </style>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-slate-800 py-3' : 'bg-transparent border-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div
            className="flex items-center space-x-2 font-heading font-bold text-2xl text-white cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>
              Apex<span className="text-cyan-400">Digital</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="text-slate-300 hover:text-cyan-400 font-medium font-body transition-colors text-sm uppercase tracking-wider"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold font-heading hover:bg-cyan-50 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Get Started
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar (retained for responsiveness) */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-950 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
            <span className="font-heading font-bold text-2xl text-white">
              Menu
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="flex flex-col space-y-6 flex-grow">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setIsOpen(false);
                  scrollToSection(item.id);
                }}
                className="text-2xl font-heading text-left text-white hover:text-cyan-400"
              >
                {item.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              scrollToSection('contact');
            }}
            className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold text-lg font-heading mt-auto"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </>
  );
};

// --- HERO SECTION ---

const Hero = ({ scrollToSection }) => {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950 min-h-[90vh] flex items-center"
    >
      {/* Background image for hero section */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1510511459019-5ffe77d6a718?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}
      ></div>
      <WireframeMesh /> {/* Wireframe mesh on top of the image */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center w-full">
        <ScrollFadeIn delay="0ms">
          <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-700 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm shadow-lg cursor-default">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Trusted Digital Partners
            </span>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay="100ms">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-heading leading-tight mb-8 drop-shadow-2xl">
            Unlocking Your <br />
            <span className="text-gradient">Digital Potential</span>
          </h1>
        </ScrollFadeIn>

        <ScrollFadeIn delay="200ms">
          <p className="text-xl md:text-2xl text-slate-300 font-body max-w-3xl mx-auto mb-12 leading-relaxed">
            Custom Website Development, SEO Dominance, and Reputation
            Management. The pillars of modern business success.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn delay="300ms">
          {/* UPDATED BUTTONS WITH SPECIFIC COLORS */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold font-heading text-lg shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all transform hover:-translate-y-1"
            >
              Get Your Free Analysis
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-full font-bold font-heading shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all transform hover:-translate-y-1 flex items-center justify-center group"
            >
              View Pricing
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </ScrollFadeIn>

        {/* Stats / Social Proof with CountUp */}
        <ScrollFadeIn
          delay="500ms"
          className="mt-20 pt-10 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 md:gap-20 bg-slate-950/50 backdrop-blur-sm rounded-xl mx-auto max-w-5xl"
        >
          {[
            { label: 'Client Websites', val: 250, suffix: '+' },
            { label: 'Average Rating', val: 4.9, suffix: '/5' },
            { label: 'Keywords Ranked', val: 12000, suffix: '+' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center transform hover:scale-110 transition-transform duration-300 cursor-default"
            >
              <div className="text-4xl md:text-5xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {/* Special handling for 4.9 average rating without counting up */}
                {stat.val === 4.9 ? (
                  <span>4.9/5</span>
                ) : (
                  <CountUp end={stat.val.toString()} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-sm text-cyan-500 font-body uppercase tracking-widest mt-2 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </ScrollFadeIn>
      </div>
    </section>
  );
};

// --- SERVICES SECTION (Distinct Categories) ---

const Services = () => {
  const serviceCategories = [
    {
      title: 'Website Development',
      icon: Layout,
      desc: 'We build custom, high-speed, and secure websites engineered for lead generation and brand authority. No templates, just performance.',
      features: [
        'Custom High-Performance Code',
        'Mobile-First Architecture',
        'Conversion Rate Optimization',
        'Speed Optimization (90+ Score)',
      ],
      cta: 'View Web Portfolio',
      bgImage:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'SEO (Search Engine Optimization)',
      icon: TrendingUp,
      desc: 'Dominate search results and capture high-intent traffic. We handle all aspects: technical, content, and high-authority link building.',
      features: [
        'Technical SEO Audits',
        'High-Authority Backlinks',
        'Keyword Dominance Strategy',
        'Content Marketing Engines',
      ],
      cta: 'See SEO Results',
      bgImage:
        'https://images.unsplash.com/photo-1557426602-ef6f53e7d58a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Google Review Management',
      icon: Shield,
      desc: 'Protect and enhance your online reputation. Automated systems to generate positive reviews and manage negative feedback effectively.',
      features: [
        'Automated Review Generation',
        'Negative Review Filtering',
        'Review Removal (Terms Violation)',
        '24/7 Sentiment Monitoring',
      ],
      cta: 'Fix Your Reviews',
      bgImage:
        'https://images.unsplash.com/photo-1549923746-c50fdd43f550?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

  return (
    <section id="services" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Our Three Core Services"
          subtitle="We deliver specialized expertise in three distinct, non-mixed disciplines for maximum impact."
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {serviceCategories.map((s, i) => (
            <ScrollFadeIn key={i} delay={`${i * 150}ms`} className="h-full">
              <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-500 group h-full flex flex-col overflow-hidden">
                {/* Background Image for Service Card */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundImage: `url(${s.bgImage})` }}
                ></div>
                <div className="absolute inset-0 bg-slate-900 opacity-80 group-hover:opacity-90 transition-opacity"></div>{' '}
                {/* Overlay */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gradient-primary transition-colors duration-500 shadow-lg">
                    <s.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 font-heading">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 font-body text-sm mb-6 flex-grow">
                    {s.desc}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {s.features.map((f, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-slate-400 group-hover:text-slate-300 transition-colors"
                      >
                        <Check className="w-5 h-5 mr-3 text-cyan-500 flex-shrink-0" />
                        <span className="font-body text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-3 rounded-xl border border-slate-700 text-white font-bold font-heading hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center group-hover:border-white">
                    {s.cta} <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- PORTFOLIO / WORK PREVIEW MODAL ---

const WebsitePreviewModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isSalon = type === 'salon';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-6xl h-[85vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
        <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="bg-slate-950 px-4 py-1.5 rounded-md text-slate-400 text-xs font-mono flex items-center min-w-[300px] justify-center">
            <Layout className="w-3 h-3 mr-2 text-cyan-400" />
            {isSalon
              ? 'luxesalon-demo.apex.digital'
              : 'modern-interiors.apex.digital'}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Mock Website Content - Now with real images */}
        <div className="flex-grow overflow-y-auto bg-white custom-scroll-y">
          <img
            src={
              isSalon
                ? 'https://images.unsplash.com/photo-1596462502278-27ddab558e07?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                : 'https://images.unsplash.com/photo-1618220179428-2279fa769614?q=80&w=2932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }
            alt={
              isSalon
                ? 'Luxe & Co. Salon Website Preview'
                : 'Aura Interiors Website Preview'
            }
            className="w-full h-auto object-cover"
          />
          <div className="max-w-5xl mx-auto p-12 text-gray-800">
            <h2 className="text-3xl font-bold font-heading mb-4">
              {isSalon ? 'Luxe & Co. Salon' : 'Aura Interiors'}
            </h2>
            <p className="text-lg mb-6">
              {isSalon
                ? 'Elevating the salon experience with bespoke hair services in a chic, modern setting.'
                : 'Crafting harmonious and functional living spaces with a focus on minimalist design principles.'}
            </p>
            <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700">
              <li>Responsive design across all devices</li>
              <li>Integrated booking system / Project gallery</li>
              <li>Optimized for fast load times</li>
              <li>Enhanced user experience & engagement</li>
            </ul>
            <button
              className={`px-6 py-3 rounded-full text-white font-bold ${isSalon ? 'bg-pink-600 hover:bg-pink-700' : 'bg-stone-800 hover:bg-stone-900'} transition`}
            >
              Explore Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- INTERACTIVE WORK / REVIEWS SECTION ---

const Work = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState('salon');

  const openPreview = type => {
    setCurrentType(type);
    setModalOpen(true);
  };

  return (
    <section id="work" className="py-24 bg-slate-900 relative">
      <WebsitePreviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={currentType}
      />

      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Client Testimonials & Portfolio"
          subtitle="Real results for real businesses. See how we transform digital footprints."
        />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Case 1: Interior Design (Fixed truncated code) */}
          <ScrollFadeIn delay="0ms">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 group">
              <div
                className="h-64 relative cursor-pointer"
                onClick={() => openPreview('interior')}
              >
                <img
                  src="https://images.unsplash.com/photo-1618220179428-2279fa769614?q=80&w=2932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Aura Interiors Website Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center text-sm transform group-hover:scale-105 transition-transform">
                    View Demo <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-heading font-bold text-violet-400 mb-3">
                  Aura Interiors
                </h3>
                <p className="text-lg text-slate-400 mb-4 font-body">
                  Full website rebuild and localized SEO strategy increased
                  high-value quote requests by{' '}
                  <span className="text-white font-bold">185%</span> in six
                  months.
                </p>
                <div className="flex items-center space-x-2 text-cyan-500 font-bold text-sm">
                  <Users className="w-5 h-5" />
                  <span>Interior Design / Local SEO</span>
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Case 2: Hair Salon */}
          <ScrollFadeIn delay="150ms">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group">
              <div
                className="h-64 relative cursor-pointer"
                onClick={() => openPreview('salon')}
              >
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27ddab558e07?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Luxe & Co. Salon Website Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center text-sm transform group-hover:scale-105 transition-transform">
                    View Demo <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-heading font-bold text-cyan-400 mb-3">
                  Luxe & Co. Salon
                </h3>
                <p className="text-lg text-slate-400 mb-4 font-body">
                  Implemented automated review generation and optimized booking
                  funnel, leading to a{' '}
                  <span className="text-white font-bold">
                    4.9/5 star rating
                  </span>{' '}
                  and a 30% reduction in missed appointments.
                </p>
                <div className="flex items-center space-x-2 text-violet-500 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Reputation Management / Conversion Optimization</span>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
};

// --- PRICING SECTION ---

const Pricing = () => {
  const [selectedService, setSelectedService] = useState('web');

  const pricingPlans = {
    web: [
      {
        name: 'Starter Site',
        price: '2,500',
        desc: 'Foundation for new businesses. 5-page static build, optimized for speed.',
        features: [
          '5-Page Custom Design',
          'Mobile Optimization',
          'Basic SEO Setup',
          '1 Month Support',
        ],
        highlight: false,
      },
      {
        name: 'Business Engine',
        price: '4,900',
        desc: 'The standard for growing businesses. Focused on lead generation and integration.',
        features: [
          '10-Page Custom Build',
          'Advanced CRM Integration',
          'Conversion Optimized Forms',
          '6 Months Priority Support',
        ],
        highlight: true,
      },
      {
        name: 'Apex Platform',
        price: '8,000+',
        desc: 'Enterprise-grade solution. Full e-commerce, custom functionality, and scalable architecture.',
        features: [
          'Unlimited Pages',
          'Custom Application Development',
          'Full E-commerce Integration',
          '1 Year Dedicated Support',
        ],
        highlight: false,
      },
    ],
    seo: [
      {
        name: 'Local Focus',
        price: '999',
        desc: 'Dominate local search results (Google Maps, 3-Pack). Perfect for local service providers.',
        features: [
          '5 Key Service Areas',
          'Google My Business Optimization',
          'Citation Audit & Build',
          'Monthly Reporting',
        ],
        highlight: false,
      },
      {
        name: 'Regional Authority',
        price: '2,499',
        desc: 'Aggressive SEO for competitive markets across multiple cities or regions.',
        features: [
          '15 Key Service Areas',
          'Advanced Technical SEO',
          'Content Strategy & Execution',
          'Quarterly Strategy Review',
        ],
        highlight: true,
      },
      {
        name: 'National Authority',
        price: '5,000+',
        desc: 'Dominate competitive national keywords. For brands with global or country-wide reach.',
        features: [
          'Enterprise Keyword Targeting',
          'Full Competitor Analysis',
          'High-Tier Link Acquisition (PR)',
          'Dedicated SEO Account Manager',
        ],
        highlight: false,
      },
    ],
    reputation: [
      {
        name: 'Basic Shield',
        price: '299',
        desc: 'Fundamental protection and a steady flow of new, positive reviews.',
        features: [
          'Automated Review Request Link',
          'Monthly Report',
          'Google/Yelp/FB Integration',
          'Basic Notification Setup',
        ],
        highlight: false,
      },
      {
        name: 'Growth Guardian',
        price: '799',
        desc: 'Proactive defense and rapid positive review generation for high-volume service businesses.',
        features: [
          'Negative Review Intercept Funnel',
          'Employee Performance Tracking',
          'Full Listing Sync (50+ Sites)',
          '24/7 Threat Monitoring',
        ],
        highlight: true,
      },
      {
        name: 'Enterprise Defense',
        price: '1,500+',
        desc: 'The highest level of brand protection for multi-location or high-profile companies.',
        features: [
          'Dedicated Conflict Resolution Manager',
          'Review Removal Appeals',
          'Custom Brand Monitoring',
          'Crisis Management Protocol',
        ],
        highlight: false,
      },
    ],
  };

  const plans = pricingPlans[selectedService];

  const renderFeatures = (features, highlight) => (
    <ul className="space-y-4 mb-10 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start text-slate-400">
          <Check
            className={`w-5 h-5 mr-3 flex-shrink-0 ${highlight ? 'text-white' : 'text-cyan-400'}`}
          />
          <span className="font-body text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  );

  const tabClass = active =>
    `px-6 py-2 rounded-full font-heading font-semibold text-sm transition-all duration-300 ${
      active
        ? 'bg-gradient-primary text-white shadow-lg shadow-violet-500/30'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
    }`;

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Transparent, Scalable Pricing"
          subtitle="Choose the service focus that matches your immediate business goals."
        />

        <ScrollFadeIn delay="0ms">
          {/* Pricing Tabs */}
          <div className="flex justify-center mb-16">
            <div className="p-1 bg-slate-900 border border-slate-700 rounded-full flex space-x-2">
              <button
                className={tabClass(selectedService === 'web')}
                onClick={() => setSelectedService('web')}
              >
                Website Development
              </button>
              <button
                className={tabClass(selectedService === 'seo')}
                onClick={() => setSelectedService('seo')}
              >
                SEO Services (Monthly)
              </button>
              <button
                className={tabClass(selectedService === 'reputation')}
                onClick={() => setSelectedService('reputation')}
              >
                Reputation Management (Monthly)
              </button>
            </div>
          </div>
        </ScrollFadeIn>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <ScrollFadeIn key={i} delay={`${i * 150}ms`} className="h-full">
              <div
                className={`p-8 rounded-3xl h-full flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-slate-900 border border-violet-500/50 shadow-[0_0_30px_rgba(124,58,237,0.3)] transform scale-[1.03]'
                    : 'bg-slate-900 border border-slate-800'
                }`}
              >
                {plan.highlight && (
                  <span className="text-xs uppercase tracking-widest font-bold text-center bg-violet-600 text-white rounded-full py-1 px-3 mb-4 self-start">
                    Most Popular
                  </span>
                )}
                <h3 className="text-3xl font-bold font-heading text-white mb-4">
                  {plan.name}
                </h3>
                <p className="text-slate-400 font-body text-sm mb-6">
                  {plan.desc}
                </p>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold font-heading text-white">
                    ${plan.price}
                  </span>
                  <span className="text-slate-400">
                    {selectedService === 'web' ? ' (One-time)' : ' / Month'}
                  </span>
                </div>

                {renderFeatures(plan.features, plan.highlight)}

                <button
                  className={`w-full py-4 rounded-xl font-bold font-heading mt-auto transition-all transform hover:-translate-y-0.5 ${
                    plan.highlight
                      ? 'bg-gradient-primary text-white shadow-lg hover:shadow-violet-500/50'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Start Now
                </button>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FAQ SECTION ---

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ScrollFadeIn className="mb-4 border-b border-slate-700/50">
      <button
        className="flex justify-between items-center w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-heading font-medium text-white hover:text-cyan-400 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'transform rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-slate-400 font-body pr-8">{answer}</p>
      </div>
    </ScrollFadeIn>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: 'How long does a typical website development project take?',
      answer:
        'Our standard Business Engine projects typically take 6-8 weeks from initial kickoff to launch. Complex platforms or highly customized solutions (Apex Platform) can take 3-6 months.',
    },
    {
      question: 'Do you offer ongoing maintenance and support?',
      answer:
        'Yes, all our development projects include a support period (1-6 months depending on the plan). We also offer monthly maintenance retainer packages to keep your site secure, fast, and up-to-date.',
    },
    {
      question: 'What is the ROI of your SEO services?',
      answer:
        'Our goal is always profitable growth. While we cannot guarantee rankings, we focus on high-intent commercial keywords. Many clients see a positive return (based on lead value) within 6-12 months of consistent strategy execution.',
    },
    {
      question: 'Can you help us if our current website is built on WordPress?',
      answer:
        'Absolutely. We offer audits, speed optimization, and migration services for existing platforms like WordPress, Shopify, and others. We often re-build high-performance versions of existing sites.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="We aim for complete transparency. Find quick answers to the most common inquiries."
        />

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CONTACT SECTION (API integration preparation) ---

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Web Development',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // --- API Placeholder Logic ---
    console.log('Submitting data:', formData);

    try {
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful submission
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        service: 'Web Development',
        message: '',
      });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Input = ({ name, type = 'text', placeholder, label }) => (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2 font-body">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required
        className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-cyan-500 focus:ring-cyan-500 transition-colors placeholder:text-slate-500 font-body"
      />
    </div>
  );

  const StatusMessage = ({ status }) => {
    if (!status) return null;

    const isSuccess = status === 'success';

    return (
      <div
        className={`p-4 mb-6 rounded-xl text-center font-bold font-body transition-all duration-300 ${
          isSuccess
            ? 'bg-green-600/20 text-green-400 border border-green-700'
            : 'bg-red-600/20 text-red-400 border border-red-700'
        }`}
      >
        {isSuccess
          ? 'Thank you! Your inquiry has been successfully sent. We will be in touch shortly.'
          : 'Oops! There was an error sending your message. Please try again or contact us via phone.'}
      </div>
    );
  };

  return (
    <section id="contact" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Ready to Grow? Let's Talk."
          subtitle="Schedule your free digital analysis session. No obligation, just actionable insights."
        />

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          {/* Contact Form (Left) */}
          <ScrollFadeIn delay="0ms">
            <form onSubmit={handleSubmit} className="w-full">
              <h3 className="text-2xl font-bold font-heading text-white mb-6 border-b border-slate-800 pb-4">
                Request a Callback
              </h3>

              <StatusMessage status={status} />

              <Input name="name" placeholder="Your Name or Company" label="Full Name / Company" />
              <Input name="email" type="email" placeholder="you@company.com" label="Work Email" />

              <div className="mb-6">
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-slate-300 mb-2 font-body"
                >
                  Service of Interest
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-cyan-500 focus:ring-cyan-500 appearance-none transition-colors font-body"
                >
                  <option>Web Development</option>
                  <option>SEO Strategy (Monthly)</option>
                  <option>Reputation Management (Monthly)</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-300 mb-2 font-body"
                >
                  Your Message / Project Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project and goals..."
                  className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-cyan-500 focus:ring-cyan-500 transition-colors placeholder:text-slate-500 font-body"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold font-heading text-lg flex items-center justify-center hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Submit Inquiry
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          </ScrollFadeIn>

          {/* Contact Details (Right) */}
          <ScrollFadeIn delay="150ms">
            <div className="p-8 h-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-center">
              <h3 className="text-2xl font-bold font-heading text-cyan-400 mb-6 border-b border-slate-800 pb-4">
                Direct Contact
              </h3>
              <ul className="space-y-6 text-slate-300">
                <li className="flex items-start">
                  <Phone className="w-6 h-6 mr-4 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg font-heading text-white">
                      Call Us
                    </p>
                    <p className="text-sm font-body">
                      (555) 123-4567 - M-F 9am-5pm EST
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Mail className="w-6 h-6 mr-4 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg font-heading text-white">
                      Email Us
                    </p>
                    <p className="text-sm font-body">
                      hello@apexdigital.co
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users className="w-6 h-6 mr-4 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg font-heading text-white">
                      Business Address
                    </p>
                    <p className="text-sm font-body">
                      123 Tech Drive, Suite 200, Innovation City, CA 90210
                    </p>
                  </div>
                </li>
              </ul>
              
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
};

// --- FOOTER ---

const Footer = ({ scrollToSection }) => (
  <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 border-b border-slate-800 pb-10">
        {/* Logo & Tagline */}
        <div className="md:col-span-1">
          <div
            className="flex items-center space-x-2 font-heading font-bold text-2xl text-white mb-4 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>
              Apex<span className="text-cyan-400">Digital</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm font-body">
            Elevating businesses to their digital peak. Specializing in
            performance and authority.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-heading font-bold text-lg mb-4">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {['Services', 'Work', 'Pricing', 'FAQ'].map(item => (
              <li key={item}>
                <button
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-slate-400 hover:text-cyan-400 text-sm transition-colors font-body"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Services */}
        <div>
          <h4 className="text-white font-heading font-bold text-lg mb-4">
            Services
          </h4>
          <ul className="space-y-3">
            {['Custom Websites', 'Advanced SEO', 'Reputation Management', 'Consulting'].map(
              (service, i) => (
                <li key={i}>
                  <span className="text-slate-400 text-sm font-body hover:text-cyan-400 transition-colors cursor-default">
                    {service}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Contact & Legal */}
        <div>
          <h4 className="text-white font-heading font-bold text-lg mb-4">
            Direct Contact
          </h4>
          <ul className="space-y-3 text-sm font-body">
            <li className="text-slate-300 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-cyan-400" />
              hello@apexdigital.co
            </li>
            <li className="text-slate-300 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-cyan-400" />
              (555) 123-4567
            </li>
            <li className="text-slate-500 pt-4">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-8 text-center text-sm text-slate-500 font-body">
        &copy; {new Date().getFullYear()} Apex Digital. All rights reserved.
      </div>
      {/* The main purpose of this div is to hold the footer content */}
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  const sectionsRef = useRef({});

  const scrollToSection = useCallback(id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = '#020617';
  }, []);

  return (
    <div className="min-h-screen antialiased bg-slate-950 font-body">
      <Header scrollToSection={scrollToSection} />
      <main>
        <Hero scrollToSection={scrollToSection} />
        <ClientMarquee />
        <Services />
        <Work />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default App;
