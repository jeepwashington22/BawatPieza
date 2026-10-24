"use client";

import { forwardRef, useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { wrap } from "@motionone/utils";
import { cn } from "@/lib/utils";

interface TextMarqueeProps {
  children: string;
  baseVelocity?: number;
  className?: string;
  scrollDependent?: boolean;
  delay?: number;
}

const TextMarquee = forwardRef<HTMLDivElement, TextMarqueeProps>(
  (
    {
      children,
      baseVelocity = -5,
      className,
      scrollDependent = false,
      delay = 0,
    },
    ref,
  ) => {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: 50,
      stiffness: 400,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
      clamp: false,
    });
    const x = useTransform(baseX, (value) => `${wrap(-20, -45, value)}%`);
    const directionFactor = useRef(1);
    const hasStarted = useRef(false);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        hasStarted.current = true;
      }, delay);

      return () => window.clearTimeout(timer);
    }, [delay]);

    useAnimationFrame((_, delta) => {
      if (!hasStarted.current) return;

      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      if (scrollDependent) {
        const velocity = velocityFactor.get();
        if (velocity < 0) {
          directionFactor.current = -1;
        } else if (velocity > 0) {
          directionFactor.current = 1;
        }
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    return (
      <div ref={ref} className="flex flex-nowrap overflow-hidden whitespace-nowrap">
        <motion.div className="flex flex-nowrap gap-10 whitespace-nowrap" style={{ x }}>
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={cn("block text-[8vw]", className)}>
              {children}
            </span>
          ))}
        </motion.div>
      </div>
    );
  },
);

TextMarquee.displayName = "TextMarquee";

export default TextMarquee;
