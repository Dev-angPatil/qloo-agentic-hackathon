import { TargetAndTransition, Transition, Variants } from "framer-motion";

/**
 * Authentic Liquid Jelly Physics Tokens
 * Soft-body gelatinous squash & stretch, low damping spring reverberations,
 * and fluid boundary deformation.
 */

// Fluid elastic spring for morphing and expanding views
export const liquidSpring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 20,
  mass: 0.9,
};

// Playful tactile jelly tap rebound with non-uniform squash and spring rebound
export const jellyTap: TargetAndTransition = {
  scaleX: 1.15,
  scaleY: 0.85,
  transition: {
    type: "spring",
    stiffness: 450,
    damping: 12,
  },
};

// Full soft-body gelatinous jiggle variants (alternating squash and stretch)
export const jiggleVariants: Variants = {
  idle: {
    scaleX: 1,
    scaleY: 1,
    scale: 1,
    rotate: 0,
    borderRadius: "32px",
  },
  hover: {
    scaleX: [1, 1.12, 0.92, 1.06, 0.97, 1.02, 1],
    scaleY: [1, 0.90, 1.10, 0.95, 1.03, 0.99, 1],
    rotate: [0, -2, 2, -1, 0.5, 0],
    borderRadius: [
      "32px",
      "42px 22px 40px 24px",
      "22px 42px 24px 40px",
      "36px 28px 34px 30px",
      "32px",
    ],
    transition: {
      duration: 0.75,
      ease: "easeInOut",
      times: [0, 0.18, 0.38, 0.58, 0.78, 0.9, 1],
    },
  },
  tap: {
    scaleX: [1, 1.28, 0.82, 1.14, 0.94, 1.02, 1],
    scaleY: [1, 0.74, 1.22, 0.88, 1.06, 0.98, 1],
    rotate: [0, -3, 3, -1.5, 0.8, 0],
    borderRadius: [
      "32px",
      "48px 16px 46px 18px",
      "16px 48px 18px 46px",
      "38px 26px 36px 28px",
      "32px",
    ],
    transition: {
      duration: 0.65,
      ease: [0.175, 0.885, 0.32, 1.275],
    },
  },
};

// Draggable jelly block configuration
export const jellyDragConfig = {
  drag: true,
  dragSnapToOrigin: true,
  dragElastic: 0.65,
  dragTransition: {
    bounceStiffness: 350,
    bounceDamping: 10,
    power: 0.2,
  },
  whileDrag: {
    scaleX: 1.12,
    scaleY: 0.9,
    scale: 1.05,
    cursor: "grabbing",
    zIndex: 50,
    boxShadow: "0 30px 60px -10px rgba(0, 0, 0, 0.6)",
  },
};

// Backward compatibility alias
export const floatingDragConfig = jellyDragConfig;
