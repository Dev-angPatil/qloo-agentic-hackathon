import { TargetAndTransition, Transition, Variants } from "framer-motion";

/**
 * Nothing-inspired Liquid Monochrome Physics Tokens
 */

// Fluid elastic spring for morphing and expanding
export const liquidSpring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 20,
  mass: 0.9,
};

// Playful tactile jelly tap rebound
export const jellyTap: TargetAndTransition = {
  scale: 0.94,
  rotate: -1.2,
  transition: {
    type: "spring",
    stiffness: 500,
    damping: 15,
  },
};

// Organic wobble/jiggle keyframes
export const jiggleVariants: Variants = {
  idle: {
    rotate: 0,
    scale: 1,
  },
  hover: {
    scale: 1.03,
    rotate: [0, -1.2, 1.2, -0.6, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    rotate: [-2, 2, -1, 1, 0],
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Draggable floating block bounds and elasticity
export const floatingDragConfig = {
  drag: true,
  dragElastic: 0.25,
  dragMomentum: true,
  whileDrag: {
    scale: 1.08,
    rotate: 2,
    zIndex: 50,
    boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.15)",
  },
};
