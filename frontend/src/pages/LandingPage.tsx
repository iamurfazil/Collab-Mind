import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useStore } from "../store";
import { useLocation } from "react-router-dom";
import {
  Rocket,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Shield,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  CheckCircle,
  Send,
  Menu,
  X,
  Trophy,
  Cpu,
} from "lucide-react";
import Canvas3D from "../components/Canvas3D";
import Footer from "../components/Footer";

// V2 UPGRADED FEATURES (All 8 Features)
const features = [
  {
    id: 1,
    title: "Problem Marketplace (Core)",
    desc: "Post real-world problems, validate ideas through community upvotes, and discover high-impact challenges.",
    icon: Target,
    isNew: false,
  },
  {
    id: 2,
    title: "AI Problem Validation (CMVC)",
    desc: "Powered by Collab Mind Validation Core (CMVC) — analyzes feasibility, impact, and demand before building.",
    icon: Cpu,
    isNew: true,
  },
  {
    id: 3,
    title: "Smart Skill Matching",
    desc: "AI matches users with the right collaborators based on skills, interests, and project needs.",
    icon: Zap,
    isNew: false,
  },
  {
    id: 4,
    title: "Team Formation Hub",
    desc: "Build or join teams seamlessly around validated problems and shared goals.",
    icon: Users,
    isNew: false,
  },
  {
    id: 5,
    title: "Real-Time Collaboration",
    desc: "Integrated chat, file sharing, and discussion threads for smooth teamwork.",
    icon: MessageSquare,
    isNew: false,
  },
  {
    id: 6,
    title: "Project Lifecycle Tracking",
    desc: "Track milestones from idea → validation → building → publishing.",
    icon: TrendingUp,
    isNew: false,
  },
  {
    id: 7,
    title: "Proof of Work & Credibility",
    desc: "Showcase contributions, earn credits, and build a public innovation profile.",
    icon: Award,
    isNew: false,
  },
  {
    id: 8,
    title: "Open Innovation Challenges",
    desc: "Organizations and individuals can launch challenges and crowdsource solutions.",
    icon: Trophy,
    isNew: true,
  },
];

const steps = [
  {
    num: "01",
    title: "Post Your Problem",
    desc: "Describe your real-world challenge and what you need from builders",
    icon: Rocket,
    color: "from-orange-500 to-orange-400"
  },
  {
    num: "02",
    title: "Get Matched",
    desc: "Our system connects you with skilled students who can help",
    icon: Zap,
    color: "from-blue-500 to-indigo-400"
  },
  {
    num: "03",
    title: "Collaborate & Build",
    desc: "Work together through our integrated chat and tracking tools",
    icon: Users,
    color: "from-purple-500 to-pink-400"
  },
  {
    num: "04",
    title: "Launch & Earn",
    desc: "Complete projects, earn certificates, and build your reputation",
    icon: Award,
    color: "from-green-500 to-emerald-400"
  },
];

function AnimatedCounter({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function StatCard({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-2xl p-6 text-center card-3d"
    >
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
      <div className={`text-sm font-medium text-gray-600`}>{label}</div>
    </motion.div>
  );
}

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const { feedbackList, addFeedback } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    userName: "",
    email: "",
    category: "general",
    message: "",
    contactPermission: false,
  });
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const approvedFeedback = (feedbackList || []).filter((f: any) => f?.status === "approved");

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFeedback(feedbackForm);
      setFeedbackStatus("success");
      setFeedbackForm({
        userName: "",
        email: "",
        category: "general",
        message: "",
        contactPermission: false,
      });
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    } catch {
      setFeedbackStatus("error");
    }
  };

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 10]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      {/* Header */}
      <motion.header
        style={{ opacity: headerOpacity, backdropFilter: headerBlur }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="flex items-center gap-3 cursor-hover"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src="collabmindbg.jpeg"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold gradient-text">
                Collab Mind
              </span>
            </motion.div>

            <nav className="hidden md:flex items-center gap-8">
              {[
                "How It Works",
                "Features",
                "Testimonials",
                "About",
              ].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors cursor-hover"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/auth">
                <motion.button
                  className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl border border-orange-300 hover:border-orange-400 transition-all btn-shine cursor-hover"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 40px rgba(240, 128, 18, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              <button
                className="md:hidden p-2 cursor-hover"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden glass border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {[
                "How It Works",
                "Features",
                "Testimonials",
                "About",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="block py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Canvas3D />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-500">
                Where Ideas Meet Execution
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="block text-orange-500">Solve Real Problems</span>
              <span className="gradient-text">With Real Builders</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-10">
              Collab Mind connects problem owners with talented student
              builders. Transform ideas into impact through collaboration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-2xl border border-orange-300 hover:border-orange-400 transition-all btn-shine cursor-hover"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 60px rgba(240, 128, 18, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Building Today
                </motion.button>
              </Link>

              <motion.a
                href="#how-it-works"
                className="px-8 py-4 glass text-gray-700 font-semibold text-lg rounded-2xl cursor-hover"
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(240, 128, 18, 0.1)",
                }}
              >
                See How It Works
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <StatCard
              value={5000}
              suffix="+"
              label="Active Builders"
              delay={0}
            />
            <StatCard
              value={1200}
              suffix="+"
              label="Projects Completed"
              delay={0.1}
            />
            <StatCard
              value={850}
              suffix="+"
              label="Problems Solved"
              delay={0.2}
            />
            <StatCard value={98} suffix="%" label="Success Rate" delay={0.3} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">How </span>
              <span className="gradient-text">Collab Mind</span>
              <span className="text-gray-900"> Works</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              From problem to solution in four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 -translate-y-1/2 z-0" />

            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10"
              >
                <div className="glass rounded-3xl p-8 h-full border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="text-sm font-black tracking-widest text-orange-500 mb-2">
                    STEP {step.num}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    {step.desc}
                  </p>

                  {/* Corner Accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-tr-3xl transition-opacity duration-500`} />
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-6 transform -translate-y-1/2 z-20 items-center justify-center">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="w-6 h-6 text-orange-500/50" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- UPGRADED V2 FEATURES SECTION --- */}
      <section
        id="features"
        className="py-24 relative machined-metal noise-overlay bg-gray-50/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Everything you need to turn real-world problems into validated
              solutions
            </p>
          </motion.div>

          {/* Features Grid (2 columns on desktop, 1 on mobile) */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 cursor-hover"
              >
                {/* NEW Badge */}
                {feature.isNew && (
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-sm">
                      New
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-5">
                  {/* Icon Wrapper */}
                  <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 pr-12">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">What </span>
              <span className="gradient-text">Builders Say</span>
            </h2>
            <p className="text-xl text-gray-500">Hear from our community</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {approvedFeedback.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 card-3d"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-gray-500 mb-6 italic">
                  "{testimonial.message}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold ring-2 ring-orange-500/50">
                    {testimonial.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.formattedDate}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 relative machined-metal noise-overlay"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Our <span className="gradient-text">Mission</span>
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Collab Mind was born from a simple belief: the best solutions
                come when great minds work together.
              </p>
              <p className="text-gray-600 mb-8">
                We bridge the gap between real-world problem owners and talented
                student builders, creating opportunities for meaningful
                collaboration and hands-on learning experience.
              </p>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-orange-500/30">
                  MF
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    Mohammad Fazil
                  </div>
                  <div className="text-orange-500">Founder</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="glass rounded-2xl p-6 text-center">
                <Shield className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-gray-500">Verified Users</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <Award className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-gray-500">Certificates Issued</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <Users className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-gray-500">University Partners</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <Rocket className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">$2M+</div>
                <div className="text-gray-500">Project Value</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 opacity-20 blur-xl" />

                <img
                  src="fazil.jpeg" // 🔥 Put your image inside public folder
                  alt="Founder"
                  className="relative w-80 md:w-96 rounded-3xl object-cover border border-orange-200 shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Right - Words */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                A Message From The{" "}
                <span className="gradient-text">Founder</span>
              </h2>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                When I started Collab Mind, I wasn’t trying to build just
                another platform. I wanted to create an ecosystem where students
                don’t just learn theory — they solve real problems.
              </p>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                I’ve seen talent go unnoticed simply because opportunity wasn’t
                structured properly. Collab Mind is built to change that — to
                connect ambition with execution.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                This is more than collaboration. This is ownership. This is
                impact. And we’re just getting started.
              </p>

              <div className="mt-8">
                <div className="text-xl font-semibold text-gray-900">
                  Mohammad Fazil
                </div>
                <div className="text-orange-500">Founder, Collab Mind</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-400/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Ready to <span className="gradient-text">Transform</span> Your
              Ideas?
            </h2>
            <p className="text-xl text-gray-500 mb-8">
              Join thousands of problem owners and builders creating impact
              together
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=register">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-2xl border border-orange-300 hover:border-orange-400 transition-all btn-shine cursor-hover"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 60px rgba(240, 128, 18, 0.4)",
                  }}
                >
                  Join Now — It's Free
                </motion.button>
              </Link>
              <Link to="/auth?mode=login">
                <motion.button
                  className="px-8 py-4 glass text-gray-700 font-semibold text-lg rounded-2xl cursor-hover"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(240, 128, 18, 0.1)",
                  }}
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
                Get in <span className="gradient-text">Touch</span>
              </h2>
              <p className="text-gray-500">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={feedbackForm.userName}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        userName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={feedbackForm.email}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Category
                </label>
                <select
                  value={feedbackForm.category}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="general">General Inquiry</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={feedbackForm.message}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      message: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="contactPermission"
                  checked={feedbackForm.contactPermission}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      contactPermission: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label
                  htmlFor="contactPermission"
                  className="text-sm text-gray-600"
                >
                  I'd like to receive updates about Collab Mind
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={feedbackStatus === "success"}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-2xl border border-orange-300 hover:border-orange-400 transition-all btn-shine cursor-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: feedbackStatus === "success" ? 1 : 1.02 }}
                whileTap={{ scale: feedbackStatus === "success" ? 1 : 0.98 }}
              >
                {feedbackStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Message
                  </>
                )}
              </motion.button>

              {feedbackStatus === "error" && (
                <p className="text-center text-red-500">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
