---
trigger: manual
---

This is the light theme to be used for project.

### Color Pallette

Accent:     hsl(198, 74%, 48%)
Gray:       hsl(30, 7%, 45%)
Background: hsl(40, 27%, 97%)


```css
:root, .light, .light-theme {
  --blue-1: #f4f7f8; //Usage: Backgrounds; Pairs with: Step 11, 12 text
  --blue-2: #ecf4f7; //Usage: Backgrounds; Pairs with: Step 11, 12 text
  --blue-3: #d8eff8; //Usage: Interactive Components; Pairs with: Steps 11 labels, 12 text
  --blue-4: #c5e8f6; //Usage: Interactive Components; Pairs with: Steps 11, 12 labels
  --blue-5: #b0dff1; //Usage: Interactive Components; Pairs with: Step 12 labels
  --blue-6: #99d3e9; //Usage: Borders and seperators; Pairs with: Steps 1-5 backgrounds
  --blue-7: #7ac3de;  //Usage: Borders and seperators; Pairs with: Steps 1-5 backgrounds
  --blue-8: #3eadd1;  //Usage: Borders, focus rings; Pairs with: Steps 1-5 backgrounds
  --blue-9: #19a7ce;  //Usage: Solid Backgrounds, buttons; Pairs with: White text
  --blue-10: #149abf; //Usage: Solid Backgrounds, buttons; Pairs with: White text
  --blue-11: #007497; //Usage: Secondary text, links; Pairs with: Background colors
  --blue-12: #0e3c4b; //Usage: High-contrast text; Pairs with: Background colors

  --blue-a1: #eaf5ff76;
  --blue-a2: #d2edff63;
  --blue-a3: #aee4ff76;
  --blue-a4: #49c3ff4f;
  --blue-a5: #01a4ef4e;
  --blue-a6: #019adc65;
  --blue-a7: #0292cc85;
  --blue-a8: #0094c6c1;
  --blue-a9: #009fcae6;
  --blue-a10: #0091bbeb;
  --blue-a11: #007497;
  --blue-a12: #003142f1;

  --blue-contrast: #fff;
  --blue-surface: #e8f3f9cc;
  --blue-indicator: #19a7ce;
  --blue-track: #19a7ce;
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    :root, .light, .light-theme {
      --blue-1: oklch(97.4% 0.004 223.1);
      --blue-2: oklch(96.1% 0.0093 223.1);
      --blue-3: oklch(93.8% 0.0267 223.1);
      --blue-4: oklch(91% 0.0414 223.1);
      --blue-5: oklch(87.7% 0.0541 223.1);
      --blue-6: oklch(83.5% 0.0664 223.1);
      --blue-7: oklch(77.9% 0.0822 223.1);
      --blue-8: oklch(70% 0.1105 223.1);
      --blue-9: oklch(67.7% 0.1219 223.1);
      --blue-10: oklch(63.9% 0.1156 223.1);
      --blue-11: oklch(51.2% 0.1219 223.1);
      --blue-12: oklch(33.4% 0.0542 223.1);

      --blue-a1: color(display-p3 0.9255 0.9608 1 / 0.417);
      --blue-a2: color(display-p3 0.8157 0.9216 1 / 0.334);
      --blue-a3: color(display-p3 0.6157 0.851 1 / 0.334);
      --blue-a4: color(display-p3 0 0.1373 1 / 0.084);
      --blue-a5: color(display-p3 0.0039 0.5725 0.8941 / 0.262);
      --blue-a6: color(display-p3 0.0039 0.5255 0.8078 / 0.346);
      --blue-a7: color(display-p3 0.0039 0.4902 0.7451 / 0.449);
      --blue-a8: color(display-p3 0 0.4863 0.7176 / 0.624);
      --blue-a9: color(display-p3 0 0.502 0.7216 / 0.691);
      --blue-a10: color(display-p3 0 0.4471 0.651 / 0.719);
      --blue-a11: color(display-p3 0 0.3216 0.4902 / 0.806);
      --blue-a12: color(display-p3 0 0.1373 0.2039 / 0.889);

      --blue-contrast: #fff;
      --blue-surface: color(display-p3 0.9176 0.949 0.9647 / 0.8);
      --blue-indicator: oklch(67.7% 0.1219 223.1);
      --blue-track: oklch(67.7% 0.1219 223.1);
    }
  }
}
```

```css

:root, .light, .light-theme {
  --gray-1: #fff3e5;
  --gray-2: #ffefe1;
  --gray-3: #f5e6d8;
  --gray-4: #eaded4;
  --gray-5: #e5d6c8;
  --gray-6: #d5cfca;
  --gray-7: #d0c3b8;
  --gray-8: #beafa2;
  --gray-9: #8e8378;
  --gray-10: #85786c;
  --gray-11: #645b53;
  --gray-12: #221f1d;

  --gray-a1: #fff3e5;
  --gray-a2: #ffefe1;
  --gray-a3: #b54c061c;
  --gray-a4: #66220320;
  --gray-a5: #7633052d;
  --gray-a6: #16060b2c;
  --gray-a7: #441b043e;
  --gray-a8: #401b0255;
  --gray-a9: #22100081;
  --gray-a10: #2612028e;
  --gray-a11: #150900a8;
  --gray-a12: #050201e1;

  --gray-contrast: #FFFFFF;
  --gray-surface: #ffffffcc;
  --gray-indicator: #8e8378;
  --gray-track: #8e8378;
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    :root, .light, .light-theme {
      --gray-1: oklch(97.3% 0.0249 64.14);
      --gray-2: oklch(96.1% 0.0249 64.14);
      --gray-3: oklch(93.3% 0.0249 64.14);
      --gray-4: oklch(90.7% 0.0184 64.14);
      --gray-5: oklch(88.4% 0.0249 64.14);
      --gray-6: oklch(85.9% 0.0092 64.14);
      --gray-7: oklch(82.5% 0.0206 64.14);
      --gray-8: oklch(76.4% 0.0249 64.14);
      --gray-9: oklch(61.6% 0.0206 64.14);
      --gray-10: oklch(58.1% 0.0249 64.14);
      --gray-11: oklch(47.7% 0.0166 64.14);
      --gray-12: oklch(24.3% 0.0065 64.14);

      --gray-a1: color(display-p3 1 0.9098 0.8157 / 0.334);
      --gray-a2: color(display-p3 0.9922 0.4431 0.0039 / 0.066);
      --gray-a3: color(display-p3 0.6078 0.2941 0.0039 / 0.103);
      --gray-a4: color(display-p3 0.3569 0.1255 0.0078 / 0.124);
      --gray-a5: color(display-p3 0.3882 0.1882 0.0039 / 0.169);
      --gray-a6: color(display-p3 0.0627 0.0039 0.0275 / 0.169);
      --gray-a7: color(display-p3 0.2353 0.0941 0.0039 / 0.239);
      --gray-a8: color(display-p3 0.2078 0.102 0.0039 / 0.326);
      --gray-a9: color(display-p3 0.1176 0.0549 0 / 0.503);
      --gray-a10: color(display-p3 0.1294 0.0588 0 / 0.552);
      --gray-a11: color(display-p3 0.0667 0.0314 0 / 0.655);
      --gray-a12: color(display-p3 0.0118 0.0039 0 / 0.881);

      --gray-contrast: #FFFFFF;
      --gray-surface: color(display-p3 1 1 1 / 80%);
      --gray-indicator: oklch(61.6% 0.0206 64.14);
      --gray-track: oklch(61.6% 0.0206 64.14);
    }
  }
}
```

```css
:root, .light, .light-theme, .radix-themes {
  --color-background: #fdf9f2;
}
```