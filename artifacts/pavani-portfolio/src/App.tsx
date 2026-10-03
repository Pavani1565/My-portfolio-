import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Github, Linkedin, Mail, MapPin, Menu, Moon, Send, Sun, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Education', href: '#education' },
  { label: 'Experience', href: '#experience' },
  { label: 'Journey', href: '#journey' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
];

const TYPE_PHRASES = ['Full-Stack Developer in Progress', 'Java Enthusiast', 'Problem Solver'];

const PROJECTS = [
  {
    number: '01',
    title: 'SLOT BUDDY',
    description: 'An automated academic timetable system with conflict-free scheduling and voice alerts for schedule changes.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Supabase', 'PostgreSQL'],
    tone: 'coral',
    href: 'https://slotbot-buddy.vercel.app/',
  },
  {
    number: '02',
    title: 'Chant Counter',
    description: 'A responsive web app to track chanting and meditation sessions with real-time counting and progress stats.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    tone: 'blue',
    href: 'https://pavani1565.github.io/chant-counter/',
  },
];

const SKILL_GROUPS = [
  {
    title: 'Currently Learning',
    note: 'Building the fundamentals',
    className: 'border-primary/40 bg-card',
    skills: [
      { label: 'HTML', width: '76%' },
      { label: 'CSS', width: '72%' },
      { label: 'Data Structures & Algorithms', width: '64%' },
    ],
  },
  {
    title: 'Want to Learn Next',
    note: 'Goal',
    className: 'border-dashed border-primary/40 bg-card',
    skills: [
      { label: 'JavaScript', width: '61%' },
      { label: 'Full-Stack Web Development', width: '58%' },
    ],
  },
  {
    title: 'Already Know / Practicing',
    note: 'In practice',
    className: 'border-primary/20 bg-card',
    skills: [
      { label: 'Java', width: '78%' },
      { label: 'Python', width: '72%' },
      { label: 'C', width: '62%' },
    ],
  },
];

const EDUCATION = [
  { qualification: 'B.Tech', field: 'Computer Science and Systems Engineering', school: 'Lendi Institute of Engineering and Technology, Vizianagaram', years: '2024–2028', score: 'CGPA: 9.21/10' },
  { qualification: 'Intermediate (MPC)', field: '', school: 'Narayana Junior College', years: '2022–2024', score: '94%' },
  { qualification: 'SSC', field: '', school: 'Fort City School', years: '2021–2022', score: '96.5%' },
];

const EXPERIENCE = [
  {
    date: '2025',
    title: 'Hackathon Participant',
    place: 'AITAM Hackathon',
    body: 'Collaborated with a team to design and build a solution under time constraints, sharpening problem-solving and rapid-prototyping skills.',
  },
  {
    date: '2025',
    title: 'Hackathon Team Leader',
    place: 'Hackroid 2.0, LNIT Summit · 48-Hour Hackathon',
    body: 'Led a team in the Finance & Banking domain; owned task allocation and solution planning under strict deadlines.',
  },
  {
    date: '2024',
    title: 'Technical Training',
    place: 'Cisco Networking Academy',
    body: 'Completed Python Essentials 1; continuously building skills in Java, full-stack development, and DSA.',
  },
  {
    date: '2024',
    title: 'AI Tools Workshop',
    place: 'BE10X',
    body: 'Hands-on training in using AI tools to boost coding, research, and workflow efficiency.',
  },
  {
    date: '2024',
    title: 'Workshop Participant',
    place: "Google Women's Day Workshop",
    body: 'Explored industry trends, career growth, and diversity in tech.',
  },
];

const CONTACT_EMAIL = 'pavani1997321@gmail.com';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function Reveal({ children, className = '', delay = '' }: { children: ReactNode; className?: string; delay?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible');
        observer.unobserve(element);
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${delay} ${className}`}>{children}</div>;
}

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid="button-theme-toggle"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-background/70 text-foreground transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
    >
      {dark ? <Sun size={16} strokeWidth={1.7} /> : <Moon size={16} strokeWidth={1.7} />}
    </button>
  );
}

function AppHome() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phrase, setPhrase] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'not-configured'>('idle');

  useEffect(() => {
    const stored = localStorage.getItem('pavani-theme');
    setDark(stored === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('pavani-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const target = TYPE_PHRASES[phraseIndex];
    const timer = window.setTimeout(() => {
      if (!deleting && phrase === target) {
        setDeleting(true);
        return;
      }
      if (deleting && phrase === '') {
        setDeleting(false);
        setPhraseIndex((current) => (current + 1) % TYPE_PHRASES.length);
        return;
      }
      const next = deleting ? target.slice(0, phrase.length - 1) : target.slice(0, phrase.length + 1);
      setPhrase(next);
    }, deleting ? 42 : phrase === target ? 1600 : 78);
    return () => window.clearTimeout(timer);
  }, [deleting, phrase, phraseIndex]);

  const goTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateField = (field: 'name' | 'email' | 'message', value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: '' }));
    setFormStatus('idle');
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Please add your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please use a valid email.';
    if (form.message.trim().length < 20) errors.message = 'A little more detail would help (20 characters minimum).';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      setFormStatus('not-configured');
      return;
    }

    setFormStatus('sending');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          ...form,
          to_email: CONTACT_EMAIL,
          reply_to: form.email,
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setFormStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="grain site-shell min-h-[100dvh] bg-background text-foreground">
      <header className="nav-glass fixed inset-x-0 top-0 z-40 border-b border-[var(--line)]">
        <div className="shell flex h-[72px] items-center justify-between">
          <button type="button" onClick={() => goTo('#home')} data-testid="button-home" className="group flex items-center gap-2 text-left">
            <span className="font-display text-lg font-extrabold tracking-[-.06em] text-primary">YP<span className="text-primary">.</span></span>
            <span className="hidden font-mono-custom text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:inline">digital home</span>
          </button>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <button key={item.href} type="button" onClick={() => goTo(item.href)} data-testid={`link-nav-${item.label.toLowerCase()}`} className="font-mono-custom text-[11px] uppercase tracking-[.12em] text-muted-foreground transition hover:text-primary">
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle dark={dark} onToggle={() => setDark((current) => !current)} />
            <button type="button" onClick={() => setMobileOpen((current) => !current)} data-testid="button-mobile-menu" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] md:hidden">
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-[var(--line)] px-4 py-3 md:hidden" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <button key={item.href} type="button" onClick={() => goTo(item.href)} data-testid={`link-mobile-${item.label.toLowerCase()}`} className="block w-full border-b border-[var(--line)] py-3 text-left font-mono-custom text-xs uppercase tracking-[.13em] last:border-0">
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section id="home" className="relative overflow-hidden border-b border-[var(--line)] pt-[72px]">
          <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="shell relative grid min-h-[calc(100dvh-72px)] items-center gap-14 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
            <div className="relative z-10">
              <Reveal className="mb-7 flex items-center gap-3">
                <span className="h-px w-9 bg-primary" />
                <p className="eyebrow">Hello, I’m Pavani</p>
              </Reveal>
              <Reveal delay="delay-1">
                <h1 className="font-display max-w-4xl text-[clamp(2.8rem,6vw,5.4rem)] font-extrabold leading-[.95] tracking-[-.055em]">
                  Building <span className="text-primary">useful</span><br />
                  <span className="relative inline-block">things<span className="text-primary">.</span></span>
                </h1>
              </Reveal>
              <Reveal delay="delay-2" className="mt-8 max-w-xl">
                <p className="text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                  Computer Science &amp; Systems Engineering Student (3rd Year)<br />
                  <span className="font-normal text-muted-foreground">Vizianagaram, India</span>
                </p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">I build clean, functional web experiences and love solving real-world problems through code.</p>
              </Reveal>
              <Reveal delay="delay-3" className="mt-9 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => goTo('#work')} data-testid="button-see-work" className="group inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(39,62,214,.24)]">
                  See selected work <ArrowDownRight size={16} className="transition group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <button type="button" onClick={() => goTo('#contact')} data-testid="button-say-hello" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold transition hover:-translate-y-1 hover:border-primary hover:text-primary">
                  Say hello <ArrowUpRight size={15} />
                </button>
              </Reveal>
              <Reveal delay="delay-4" className="mt-12 flex items-center gap-3 font-mono-custom text-[11px] uppercase tracking-[.12em] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_5px_rgba(44,116,179,.15)]" />
                Available for meaningful opportunities
              </Reveal>
            </div>
            <Reveal delay="delay-2" className="relative flex min-h-[380px] items-center justify-center lg:min-h-[550px]">
              <div className="absolute h-[310px] w-[310px] rounded-full bg-primary/15 blur-3xl sm:h-[420px] sm:w-[420px]" aria-hidden="true" />
              <div className="profile-orbit absolute h-[330px] w-[330px] rounded-full border border-dashed border-primary/35 sm:h-[470px] sm:w-[470px]" aria-hidden="true">
                <span className="absolute left-[13%] top-[13%] h-3 w-3 rounded-full bg-primary" />
              </div>
              <div className="profile-orbit-reverse absolute h-[260px] w-[260px] rounded-full border border-[var(--line)] sm:h-[390px] sm:w-[390px]" aria-hidden="true">
                  <span className="absolute right-[8%] top-[26%] h-2 w-2 rounded-full bg-primary/60" />
              </div>
              <div className="float-slow relative h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-white bg-card shadow-[0_20px_60px_rgba(44,116,179,.3)] ring-1 ring-primary/30 sm:h-[300px] sm:w-[300px]">
                <img
                  src={`${import.meta.env.BASE_URL}pavani-profile.jpg`}
                  alt="Yadavareddy Pavani"
                  className="h-full w-full rounded-full object-cover object-[50%_24%]"
                />
              </div>
              <div className="absolute bottom-3 right-0 max-w-[190px] rotate-3 rounded-2xl border border-[var(--line)] bg-card/85 p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:right-4">
                <p className="font-mono-custom text-[10px] uppercase leading-relaxed tracking-[.1em] text-muted-foreground">Currently typing</p>
                <p className="mt-2 text-sm font-semibold">{phrase}<span className="blink ml-0.5 text-primary">|</span></p>
              </div>
            </Reveal>
          </div>
          <div className="shell flex items-center justify-between border-t border-[var(--line)] py-4">
            <span className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-muted-foreground">Scroll to explore</span>
            <ChevronDown size={16} className="text-primary" />
            <span className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-muted-foreground">Keep exploring</span>
          </div>
        </section>

        <section id="about" className="section-pad">
          <div className="shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <Reveal>
              <p className="eyebrow">About</p>
              <h2 className="font-display mt-5 text-4xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">Curiosity is<br /><span className="text-primary">my compass.</span></h2>
            </Reveal>
            <Reveal delay="delay-1" className="lg:pt-10">
              <p className="max-w-2xl text-2xl leading-snug tracking-[-.03em] text-foreground sm:text-3xl">Third-year B.Tech student in Computer Science &amp; Systems Engineering, passionate about full-stack development and solving real-world problems through code. Constantly leveling up through hands-on projects and daily practice.</p>
              <div className="mt-8 border-t border-[var(--line)] pt-8">
                <p className="leading-relaxed text-muted-foreground">I’m drawn to problems that ask for both logic and empathy: how a system works, how a person experiences it, and how those two can meet in the middle.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-mono-custom text-xs uppercase tracking-[.12em] text-primary"><MapPin size={14} /> Vizianagaram, India</div>
            </Reveal>
          </div>
        </section>

        <section id="education" className="section-pad scroll-mt-20">
          <div className="shell">
            <Reveal>
              <p className="eyebrow">Education</p>
              <h2 className="font-display mt-4 text-4xl font-bold tracking-[-.03em] sm:text-5xl">Academic background</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {EDUCATION.map((item, index) => (
                <Reveal key={item.qualification} delay={`delay-${index + 1}`}>
                  <article className="h-full rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)]">
                    <p className="font-mono-custom text-xs font-semibold uppercase tracking-[.08em] text-primary">{item.years}</p>
                    <h3 className="font-display mt-4 text-xl font-bold tracking-[-.02em]">{item.qualification}</h3>
                    {item.field && <p className="mt-2 text-sm leading-relaxed">{item.field}</p>}
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.school}</p>
                    <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm font-semibold text-primary">{item.score}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="scroll-mt-20 border-y border-[var(--line)] bg-background">
          <div className="shell section-pad">
            <Reveal>
              <p className="eyebrow">Experience</p>
              <h2 className="font-display mt-4 text-4xl font-bold tracking-[-.03em] sm:text-5xl">Learning by doing</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {EXPERIENCE.map((item, index) => (
                <Reveal key={`${item.date}-${item.title}`} delay={`delay-${(index % 4) + 1}`}>
                  <article className="h-full rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)]">
                    <p className="font-mono-custom text-xs font-semibold uppercase tracking-[.08em] text-primary">{item.date}</p>
                    <h3 className="font-display mt-3 text-xl font-bold tracking-[-.02em]">{item.title}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{item.place}</p>
                    <p className="mt-4 leading-relaxed text-muted-foreground">{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="journey" className="section-pad scroll-mt-20">
          <div className="shell grid gap-8 md:grid-cols-[.7fr_1.3fr] md:items-center">
            <Reveal>
              <p className="eyebrow">Journey</p>
              <h2 className="font-display mt-4 text-4xl font-bold tracking-[-.03em] sm:text-5xl">What’s next</h2>
            </Reveal>
            <Reveal delay="delay-1">
              <p className="text-xl leading-relaxed text-muted-foreground">
                Motivated CS student building strong foundations in full-stack development and data structures &amp; algorithms. Looking for opportunities to learn from experienced teams and ship scalable, user-focused software.
              </p>
            </Reveal>
          </div>
        </section>

        <section id="work" className="section-pad">
          <div className="shell">
             <Reveal><p className="eyebrow">Selected work</p><div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="font-display max-w-xl text-4xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">Small projects.<br /><span className="text-primary">Real lessons.</span></h2><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">A few places where curiosity became code.</p></div></Reveal>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {PROJECTS.map((project, index) => (
                <Reveal key={project.number} delay={`delay-${index + 1}`}>
                  <a href={project.href} target="_blank" rel="noreferrer" data-testid={`link-project-${project.number}`} className="project-card group relative block min-h-[390px] overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 text-foreground shadow-[var(--shadow-soft)]">
                    <div className="flex items-start justify-between"><span className="font-mono-custom text-xs opacity-70">{project.number}</span><ArrowUpRight size={20} className="project-arrow" /></div>
                    <div className="absolute -right-8 top-24 h-40 w-40 rounded-full border border-current opacity-20" /><div className="absolute -right-1 top-32 h-24 w-24 rounded-full border border-current opacity-20" />
                   <div className="absolute bottom-6 left-6 right-6"><h3 className="font-display text-3xl font-bold leading-none tracking-[-.06em]">{project.title}</h3><p className="mt-5 max-w-[270px] text-sm leading-relaxed opacity-80">{project.description}</p><div className="mt-6 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-full border border-current/25 px-2.5 py-1 font-mono-custom text-[10px] uppercase tracking-[.08em]">{tag}</span>)}</div><span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold">Open live project <ArrowUpRight size={14} /></span></div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

         <section id="skills" className="border-y border-[var(--line)] bg-background text-foreground">
          <div className="shell section-pad grid gap-14 lg:grid-cols-[.75fr_1.25fr]">
             <Reveal><p className="eyebrow">Skills</p><h2 className="font-display mt-5 text-4xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">Tools are<br /><span className="text-primary">just the start.</span></h2><p className="mt-7 max-w-sm leading-relaxed text-muted-foreground">I’m building a dependable foundation across languages, interfaces, and the systems underneath them.</p></Reveal>
             <Reveal delay="delay-1" className="grid gap-5 sm:grid-cols-2">
               {SKILL_GROUPS.map((group) => (
                 <div key={group.title} className={`rounded-2xl border p-5 ${group.className}`}>
                   <div className="flex items-center justify-between gap-3">
                     <h3 className="font-display text-xl font-bold">{group.title}</h3>
                      <span className="font-mono-custom text-[10px] uppercase tracking-[.12em] text-muted-foreground">{group.note}</span>
                   </div>
                   <div className="mt-6 space-y-5">
                      {group.skills.map((skill) => <div key={skill.label} data-testid={`skill-${skill.label.toLowerCase().replaceAll(' ', '-')}`}><div className="mb-2 flex items-end justify-between gap-3"><span className="text-sm font-semibold">{skill.label}</span><span className="font-mono-custom text-[10px] text-muted-foreground">in progress</span></div><div className="h-1.5 overflow-hidden rounded-full bg-primary/15"><div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: skill.width }} /></div></div>)}
                   </div>
                 </div>
               ))}
            </Reveal>
          </div>
        </section>

        <section id="contact" className="section-pad">
          <div className="shell grid gap-14 lg:grid-cols-[.75fr_1.25fr]">
              <Reveal><p className="eyebrow">Contact</p><h2 className="font-display mt-5 text-4xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">Let’s make<br /><span className="text-primary">something</span><br />useful.</h2><p className="mt-7 max-w-sm leading-relaxed text-muted-foreground">Have a question, an idea, or an opportunity? Send a note and I’ll get back to you at {CONTACT_EMAIL}.</p><div className="mt-8 flex flex-wrap gap-3"><a href={`mailto:${CONTACT_EMAIL}`} data-testid="link-email" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm transition hover:border-primary hover:text-primary"><Mail size={15} /> Email me</a><a href="https://www.linkedin.com/in/yadavareddypavani/" target="_blank" rel="noreferrer" data-testid="link-linkedin" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition hover:border-primary hover:text-primary" aria-label="LinkedIn"><Linkedin size={16} /></a><a href="https://github.com/pavani1565" target="_blank" rel="noreferrer" data-testid="link-github" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition hover:border-primary hover:text-primary" aria-label="GitHub"><Github size={16} /></a></div></Reveal>
             <Reveal delay="delay-1"><form onSubmit={submitForm} noValidate className="rounded-[2rem] border border-[var(--line)] bg-card/55 p-5 shadow-[var(--shadow-soft)] sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="font-mono-custom text-[10px] uppercase tracking-[.14em] text-muted-foreground">Your name</span><input value={form.name} onChange={(event) => updateField('name', event.target.value)} data-testid="input-contact-name" name="name" autoComplete="name" className="form-field mt-2 w-full rounded-xl border border-[var(--line)] bg-background/55 px-4 py-3 text-sm" placeholder="What should I call you?" />{formErrors.name && <span data-testid="error-contact-name" className="mt-2 block text-xs text-destructive">{formErrors.name}</span>}</label><label className="block"><span className="font-mono-custom text-[10px] uppercase tracking-[.14em] text-muted-foreground">Email address</span><input value={form.email} onChange={(event) => updateField('email', event.target.value)} data-testid="input-contact-email" type="email" name="email" autoComplete="email" className="form-field mt-2 w-full rounded-xl border border-[var(--line)] bg-background/55 px-4 py-3 text-sm" placeholder="you@example.com" />{formErrors.email && <span data-testid="error-contact-email" className="mt-2 block text-xs text-destructive">{formErrors.email}</span>}</label></div><label className="mt-5 block"><span className="font-mono-custom text-[10px] uppercase tracking-[.14em] text-muted-foreground">Message</span><textarea value={form.message} onChange={(event) => updateField('message', event.target.value)} data-testid="input-contact-message" name="message" rows={6} className="form-field mt-2 w-full resize-none rounded-xl border border-[var(--line)] bg-background/55 px-4 py-3 text-sm" placeholder="Tell me what’s on your mind..." />{formErrors.message && <span data-testid="error-contact-message" className="mt-2 block text-xs text-destructive">{formErrors.message}</span>}</label><button type="submit" disabled={formStatus === 'sending'} data-testid="button-contact-submit" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(39,62,214,.22)] disabled:cursor-wait disabled:opacity-60">{formStatus === 'sending' ? 'Sending…' : 'Send a note'} <Send size={15} /></button>{formStatus === 'not-configured' && <div data-testid="status-contact-setup" className="mt-5 flex gap-3 rounded-xl border border-[var(--lime)]/60 bg-[var(--lime)]/15 p-4 text-sm leading-relaxed"><Check size={17} className="mt-0.5 shrink-0 text-primary" /><p><strong>Almost there.</strong> EmailJS is not connected yet. Add the three Vite variables shown in the setup notes to finish sending messages.</p></div>}{formStatus === 'sent' && <div data-testid="status-contact-success" className="mt-5 rounded-xl border border-[var(--lime)]/60 bg-[var(--lime)]/15 p-4 text-sm leading-relaxed"><strong>Thanks! Your message has been sent.</strong></div>}{formStatus === 'error' && <div data-testid="status-contact-error" className="mt-5 rounded-xl border border-[var(--coral)]/60 bg-[var(--coral)]/15 p-4 text-sm leading-relaxed"><strong>Something went wrong while sending.</strong> Please try again or email me directly.</div>}</form></Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
         <div className="shell flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between"><p className="font-display text-lg font-bold tracking-[-.05em]">Pavani<span className="text-[var(--coral)]">.</span></p><p className="font-mono-custom text-[10px] uppercase tracking-[.13em] text-muted-foreground">© 2026 Yadavareddy Pavani. All rights reserved.</p><button type="button" onClick={() => goTo('#home')} data-testid="button-back-top" className="inline-flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[.12em] text-primary transition hover:gap-3">Back to top <ArrowUpRight size={14} /></button></div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={AppHome} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;