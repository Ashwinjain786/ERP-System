import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, Home, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const container = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } 
  },
};

export default function NotFound() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      </div>

      <Wrapper
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center space-y-8 max-w-lg"
      >
        <motion.div className="inline-flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative bg-primary text-primary-foreground p-6 rounded-3xl shadow-lg">
              <BookOpen className="w-16 h-16" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <h1 className="font-display text-8xl font-bold text-primary tracking-tight">
            404
          </h1>
          <h2 className="text-2xl font-display font-bold">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Looks like this page wandered off campus. Let's get you back on track!
          </p>
        </motion.div>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="h-12 px-8 text-base font-bold">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8 text-base">
            <Link to="/login">
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>

        <motion.div 
          variants={item}
          className="pt-8 border-t"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Having trouble?</span>
            <a href="mailto:support@campusone.edu" className="text-primary hover:underline font-medium">
              Contact Support
            </a>
          </div>
        </motion.div>
      </Wrapper>
    </div>
  );
}
