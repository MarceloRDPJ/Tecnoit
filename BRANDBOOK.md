# TecnoIT Brand Book & Design System

## 1. Core Principles
- **Ultra Modern Aesthetic**: Glassmorphism, gradients, and subtle animations.
- **Clean & Professional**: Organized layouts, consistent typography (Inter/JetBrains Mono).
- **Immersive**: Backgrounds are not flat; they use multiple radial gradients.
- **Standardized Navigation**: "Back to Hub" is always top-left.

## 2. Color Palette

### Backgrounds
- **Main Background**: `#0f172a` (Slate 900)
- **Gradients**:
  - Purple: `hsla(253, 16%, 7%, 1)`
  - Indigo: `hsla(225, 39%, 30%, 1)`
  - Pink/Rose: `hsla(339, 49%, 30%, 1)`

### Text Gradients
- `linear-gradient(to right, #818cf8, #c084fc, #f472b6)` (Indigo-400 -> Purple-400 -> Pink-400)

### Primary Actions
- **Button Gradient**: `linear-gradient(to right, #4f46e5, #9333ea)` (Indigo-600 -> Purple-600)
- **Hover Glow**: `box-shadow: 0 0 20px rgba(124, 58, 237, 0.5)`

## 3. Typography
- **Primary Font**: `Inter`, sans-serif (UI, Text)
- **Monospace**: `JetBrains Mono` (Code, IDs, Data)
- **Headings**: Bold/ExtraBold Inter.

## 4. UI Components (CSS)

### Global Background
```css
body {
    font-family: 'Inter', sans-serif;
    background-color: #0f172a;
    background-image:
        radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
        radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%),
        radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%);
    background-attachment: fixed;
    color: #e2e8f0;
    overflow-x: hidden;
}
```

### Glass Card
```css
.glass-card {
    background: rgba(30, 41, 59, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(99, 102, 241, 0.3); /* Indigo tint */
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
}
```

### Text Gradient
```css
.text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(to right, #818cf8, #c084fc, #f472b6);
}
```

### "Back to Hub" Button (Standard)
```html
<header class="flex justify-between items-center mb-16 fade-in-up">
    <a href="../../index.html" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
        <div class="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
        </div>
        <span class="text-sm font-semibold tracking-wide uppercase">Voltar ao Hub</span>
    </a>
    <div class="flex items-center gap-3">
        <!-- Project Specific Badge/Logo Here -->
    </div>
</header>
```

### Primary Button (Glow)
```css
.btn-glow {
    background: linear-gradient(to right, #4f46e5, #9333ea);
    position: relative;
    z-index: 1;
    overflow: hidden;
    transition: all 0.3s ease;
}
.btn-glow::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to right, #4338ca, #7e22ce);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
}
.btn-glow:hover::before {
    opacity: 1;
}
.btn-glow:hover {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
    transform: scale(1.05);
}
```
