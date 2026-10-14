const fadeUp = {
  "@keyframes fadeUp": {
    from: { transform: "translateY(24px)" },
    to: { transform: "translateY(0)" },
  },
};

const fadeIn = {
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

export const scroll = {
  "@keyframes scroll": {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(-50%)" },
  },
};

const slide = (delay: number) =>
  `fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`;

const fade = (delay: number) => `fadeIn 0.55s linear ${delay}s both`;

export const enter = (delay: number) => ({
  ...fadeUp,
  ...fadeIn,
  animation: `${slide(delay)}, ${fade(delay)}`,
});

export const enterSlide = (delay: number) => ({
  ...fadeUp,
  animation: slide(delay),
});

export const enterFade = (delay: number) => ({
  ...fadeIn,
  animation: fade(delay),
});
