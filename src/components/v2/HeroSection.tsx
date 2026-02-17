"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Liquid distortion driven by scroll
  const skewX = useTransform(scrollYProgress, [0, 0.5, 1], [0, -8, 0]);
  const scaleX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1.05, 0.95, 1]);
  const letterSpacing = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-screen"
    >
      <div className="relative z-10 text-center px-4">
        {/* Subtitle above */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-cyan-400/40 text-[10px] md:text-xs tracking-[0.5em] mb-6"
        >
          AUTONOMOUS AI AUDIO SYSTEM
        </motion.p>

        {/* Main title - Liquid Typography */}
        <motion.h1
          style={{ skewX, scaleX, opacity }}
          className="relative"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="block text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold leading-none tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-cyan-400/60"
            style={{ letterSpacing: letterSpacing as unknown as string }}
          >
            NICTIA
          </motion.span>

          {/* Glitch shadow layers */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 0.1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute inset-0 text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold leading-none tracking-widest text-cyan-400"
            style={{ transform: "translate(2px, -2px)" }}
            aria-hidden
          >
            NICTIA
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 0.05 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute inset-0 text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold leading-none tracking-widest text-red-400"
            style={{ transform: "translate(-2px, 2px)" }}
            aria-hidden
          >
            NICTIA
          </motion.span>
        </motion.h1>

        {/* Version tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400/30" />
          <span className="text-white/20 text-[10px] tracking-[0.3em]">
            v2.0
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400/30" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-white/20 text-[9px] tracking-widest">
              SCROLL
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-cyan-400/30 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
