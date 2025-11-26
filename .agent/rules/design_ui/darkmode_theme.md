---
trigger: manual
---

This is the dark theme to be used for project.

### Color Pallette

Accent:     hsl(198, 74%, 48%)
Gray:       hsl(30, 7%, 45%)
Background: hsl(40, 27%, 97%)


```css
.dark, .dark-theme {
  --blue-1: #071418;  //Usage: Backgrounds; Pairs with: Step 11, 12 tex
  --blue-2: #0d1b1f; //Usage: Backgrounds; Pairs with: Step 11, 12 text
  --blue-3: #002c38; //Usage: Interactive Components; Pairs with: Steps 11 labels, 12 text
  --blue-4: #00394a; //Usage: Interactive Components; Pairs with: Steps 11, 12 labels
  --blue-5: #00465b; //Usage: Interactive Components; Pairs with: Step 12 labels
  --blue-6: #00556b; //Usage: Borders and seperators; Pairs with: Steps 1-5 backgrounds
  --blue-7: #006982; //Usage: Borders and seperators; Pairs with: Steps 1-5 backgrounds
  --blue-8: #0082a1; //Usage: Borders, focus rings; Pairs with: Steps 1-5 backgrounds
  --blue-9: #2bc9f0; //Usage: Solid Backgrounds, buttons; Pairs with: White text
  --blue-10: #0fbee5; //Usage: Solid Backgrounds, buttons; Pairs with: White text
  --blue-11: #31ccf3; //Usage: Secondary text, links; Pairs with: Background colors
  --blue-12: #b1ecff; //Usage: High-contrast text; Pairs with: Background colors

  --blue-a1: #0092d504;
  --blue-a2: #00e3fd0b;
  --blue-a3: #00bcfa27;
  --blue-a4: #00beff3a;
  --blue-a5: #00befd4d;
  --blue-a6: #00c8ff5e;
  --blue-a7: #00ccff77;
  --blue-a8: #00cdff99;
  --blue-a9: #2dd5ffef;
  --blue-a10: #0fd3ffe3;
  --blue-a11: #33d6fff2;
  --blue-a12: #b1ecff;

  --blue-contrast: #06262f;
  --blue-surface: #0c242980;
  --blue-indicator: #2bc9f0;
  --blue-track: #2bc9f0;
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    .dark, .dark-theme {
      --blue-1: oklch(18% 0.0198 219.7);
      --blue-2: oklch(21.2% 0.0211 219.7);
      --blue-3: oklch(27.1% 0.0508 219.7);
      --blue-4: oklch(31.5% 0.0726 219.7);
      --blue-5: oklch(36.1% 0.0811 219.7);
      --blue-6: oklch(41.4% 0.0863 219.7);
      --blue-7: oklch(47.8% 0.0955 219.7);
      --blue-8: oklch(55.8% 0.1136 219.7);
      --blue-9: oklch(77.6% 0.133 219.7);
      --blue-10: oklch(74.1% 0.133 219.7);
      --blue-11: oklch(78.6% 0.133 219.7);
      --blue-12: oklch(90.9% 0.0655 219.7);

      --blue-a1: color(display-p3 0 0.6745 0.9882 / 0.013);
      --blue-a2: color(display-p3 0.0667 0.9765 0.9882 / 0.039);
      --blue-a3: color(display-p3 0.0118 0.7451 0.9961 / 0.146);
      --blue-a4: color(display-p3 0.149 0.7569 1 / 0.218);
      --blue-a5: color(display-p3 0.2118 0.7608 1 / 0.291);
      --blue-a6: color(display-p3 0.2627 0.7882 1 / 0.359);
      --blue-a7: color(display-p3 0.3059 0.8078 1 / 0.453);
      --blue-a8: color(display-p3 0.3294 0.8078 1 / 0.586);
      --blue-a9: color(display-p3 0.4196 0.8392 1 / 0.919);
      --blue-a10: color(display-p3 0.3843 0.8314 1 / 0.872);
      --blue-a11: color(display-p3 0.4235 0.8431 1 / 0.932);
      --blue-a12: color(display-p3 0.749 0.9255 1 / 0.992);

      --blue-contrast: #06262f;
      --blue-surface: color(display-p3 0.0627 0.1412 0.1569 / 0.5);
      --blue-indicator: oklch(77.6% 0.133 219.7);
      --blue-track: oklch(77.6% 0.133 219.7);
    }
  }
}
```

```css
.dark, .dark-theme {
  --gray-1: #101215;
  --gray-2: #17191c;
  --gray-3: #202327;
  --gray-4: #262a30;
  --gray-5: #2c3138;
  --gray-6: #343a42;
  --gray-7: #414852;
  --gray-8: #586170;
  --gray-9: #656e7d;
  --gray-10: #737c8a;
  --gray-11: #adb4bf;
  --gray-12: #eceef1;

  --gray-a1: #8f121502;
  --gray-a2: #f2d9dc09;
  --gray-a3: #e8ebfb14;
  --gray-a4: #d3defa1e;
  --gray-a5: #cdddfa27;
  --gray-a6: #ccdefb32;
  --gray-a7: #cee0fe43;
  --gray-a8: #cadcfd64;
  --gray-a9: #d0e0fd72;
  --gray-a10: #d7e6ff80;
  --gray-a11: #e8f0feba;
  --gray-a12: #fafcfff0;

  --gray-contrast: #FFFFFF;
  --gray-surface: rgba(0, 0, 0, 0.05);
  --gray-indicator: #656e7d;
  --gray-track: #656e7d;
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    .dark, .dark-theme {
      --gray-1: oklch(18% 0.0067 259.4);
      --gray-2: oklch(21.4% 0.0069 259.4);
      --gray-3: oklch(25.4% 0.0097 259.4);
      --gray-4: oklch(28.3% 0.0124 259.4);
      --gray-5: oklch(31.1% 0.014 259.4);
      --gray-6: oklch(34.6% 0.0168 259.4);
      --gray-7: oklch(39.8% 0.0204 259.4);
      --gray-8: oklch(49% 0.0264 259.4);
      --gray-9: oklch(53.7% 0.0257 259.4);
      --gray-10: oklch(58.3% 0.024 259.4);
      --gray-11: oklch(76.8% 0.0176 259.4);
      --gray-12: oklch(94.9% 0.0048 259.4);

      --gray-a1: color(display-p3 0 0 0 / 0);
      --gray-a2: color(display-p3 0.9765 0.9882 1 / 0.03);
      --gray-a3: color(display-p3 0.9294 0.9373 1 / 0.077);
      --gray-a4: color(display-p3 0.8706 0.9137 0.9961 / 0.112);
      --gray-a5: color(display-p3 0.8431 0.9059 0.9961 / 0.146);
      --gray-a6: color(display-p3 0.8314 0.902 0.9961 / 0.189);
      --gray-a7: color(display-p3 0.8275 0.898 0.9961 / 0.257);
      --gray-a8: color(display-p3 0.8196 0.8784 1 / 0.385);
      --gray-a9: color(display-p3 0.8392 0.8902 1 / 0.441);
      --gray-a10: color(display-p3 0.8627 0.9098 1 / 0.496);
      --gray-a11: color(display-p3 0.9216 0.949 1 / 0.723);
      --gray-a12: color(display-p3 0.9804 0.9882 1 / 0.941);

      --gray-contrast: #FFFFFF;
      --gray-surface: color(display-p3 0 0 0 / 5%);
      --gray-indicator: oklch(53.7% 0.0257 259.4);
      --gray-track: oklch(53.7% 0.0257 259.4);
    }
  }
}
```

```css
.dark, .dark-theme, :is(.dark, .dark-theme) :where(.radix-themes:not(.light, .light-theme)) {
  --color-background: #0f1215;
}
```