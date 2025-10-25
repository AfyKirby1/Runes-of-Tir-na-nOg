# Style Guide - Runes of Tir na nÓg

## Overview
This style guide defines the visual design system for Runes of Tir na nÓg, a Celtic-themed top-down RPG with pixel art aesthetics. The design emphasizes mystical, medieval atmosphere with golden accents and dark backgrounds.

## Design Philosophy
- **Celtic Mysticism**: Inspired by Irish mythology and ancient Celtic art
- **Pixel Art Aesthetic**: Clean, retro-inspired visual style
- **Medieval Fantasy**: Dark, atmospheric environments with magical elements
- **Accessibility**: High contrast, readable text, and intuitive UI patterns

## Color Palette

### Primary Colors
- **Celtic Gold**: `#d4af37` - Primary accent color for text, borders, and highlights
- **Dark Navy**: `#0a0a1a` - Primary background color
- **Deep Blue**: `#1a1a2e` - Secondary background and containers
- **Forest Green**: `#4a7c59` - Game world background

### Secondary Colors
- **Bronze**: `#8b5a2b` - Secondary accent, borders, and shadows
- **Light Gold**: `#ffd700` - Hover states and highlights
- **Cream**: `#d4d4f4` - Secondary text color
- **Muted Brown**: `#8b7355` - Tertiary text and subtle elements

### Status Colors
- **Success Green**: `#4ade80` - Positive actions, success states
- **Error Red**: `#ef4444` - Errors, danger, delete actions
- **Warning Orange**: `#f59e0b` - Warnings and caution states
- **Info Blue**: `#3b82f6` - Information and neutral actions

### Special Theme Colors
- **Purple Magic**: `#a78bfa` - Tír na nÓg theme elements
- **Mystic Blue**: `#3b82f6` - Server connection and network elements

## Typography

### Font Families
- **Primary**: `'Cinzel', serif` - Main UI font, elegant and medieval
- **Secondary**: `'Courier New', monospace` - Game UI, technical elements
- **Fallback**: `serif` - System fallback

### Font Weights
- **Light**: `400` - Body text, descriptions
- **Bold**: `700` - Headings, important text
- **Heavy**: `900` - Main titles, emphasis

### Text Styling Patterns
```css
/* Main Title */
.game-title {
    font-size: 3rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #d4af37;
    text-shadow: 2px 2px 0px rgba(139,90,43,0.8), 
                 -2px -2px 0px rgba(139,90,43,0.8),
                 4px 4px 8px rgba(0,0,0,0.9);
}

/* Body Text */
.body-text {
    font-size: 1rem;
    color: #d4d4f4;
    line-height: 1.4;
}

/* Small Text */
.small-text {
    font-size: 0.8rem;
    color: #8b7355;
}
```

## Layout Patterns

### Container Structure
```css
.container {
    background: rgba(26, 26, 46, 0.85);
    border: 2px solid #d4af37;
    border-radius: 16px;
    padding: 40px 60px;
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.35),
                inset 0 0 30px rgba(212, 175, 55, 0.08);
}
```

### Background Patterns
- **Gradient Backgrounds**: `linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)`
- **Animated Elements**: Floating geometric shapes and pixel particles
- **Radial Overlays**: Subtle radial gradients for depth

## Component Styles

### Buttons

#### Primary Button
```css
.button-primary {
    background: linear-gradient(145deg, #2d5a2d, #1a3a1a);
    border: 2px solid #4ade80;
    color: #4ade80;
    padding: 14px 42px;
    border-radius: 10px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.25s ease;
}

.button-primary:hover {
    transform: translateY(-2px);
    border-color: #6ee7b7;
    color: #6ee7b7;
    box-shadow: 0 10px 22px rgba(110, 231, 183, 0.25);
}
```

#### Secondary Button
```css
.button-secondary {
    background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
    border: 2px solid #d4af37;
    color: #d4af37;
    padding: 12px 30px;
    border-radius: 8px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    transition: all 0.3s ease;
}

.button-secondary:hover {
    background: linear-gradient(145deg, #3a3a4e, #2a2a3e);
    border-color: #ffd700;
    color: #ffd700;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4),
                0 0 25px rgba(255, 215, 0, 0.4);
}
```

#### Danger Button
```css
.button-danger {
    background: linear-gradient(145deg, #5a2d2d, #3a1a1a);
    border: 2px solid #ef4444;
    color: #ef4444;
    /* Same padding and transitions as secondary */
}
```

### Form Elements

#### Input Fields
```css
.form-input {
    background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
    border: 2px solid #d4af37;
    color: #d4af37;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Cinzel', serif;
    transition: all 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #ffd700;
    color: #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}
```

#### Toggle Switches
```css
.toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
}

.toggle-slider {
    background-color: #2a2a3a;
    border: 2px solid #8b7355;
    border-radius: 30px;
    transition: 0.3s;
}

.toggle-slider:before {
    background-color: #8b7355;
    border-radius: 50%;
    transition: 0.3s;
}

input:checked + .toggle-slider {
    background-color: #654321;
    border-color: #d4af37;
}

input:checked + .toggle-slider:before {
    background-color: #d4af37;
    transform: translateX(30px);
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}
```

### Modal Windows
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: rgba(26, 26, 46, 0.95);
    border: 2px solid #d4af37;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
    max-width: 400px;
    width: 90%;
}
```

## Animation Patterns

### Hover Effects
- **Transform**: `translateY(-2px)` for lift effect
- **Duration**: `0.3s ease` for smooth transitions
- **Box Shadow**: Glowing effects on hover
- **Color Transitions**: Gold accent on hover

### Loading Animations
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes titleFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
}

@keyframes simpleFlame {
    0% { text-shadow: /* flame effect */; }
    100% { text-shadow: /* enhanced flame */; }
}
```

### Floating Elements
- **Geometric Shapes**: Triangles, squares with CSS borders
- **Pixel Particles**: Small golden dots floating upward
- **Animation Delays**: Staggered timing for natural movement

## Responsive Design

### Breakpoints
- **Mobile**: `max-width: 768px`
- **Small Mobile**: `max-width: 480px`

### Mobile Adaptations
- **Touch Targets**: Minimum 44px for accessibility
- **Font Sizes**: Reduced by 10-20% on mobile
- **Padding**: Reduced container padding
- **Animations**: Simplified for performance

### Mobile-Specific Styles
```css
@media (max-width: 768px) {
    .container {
        padding: 20px 30px;
        margin: 10px;
    }
    
    .game-title {
        font-size: 2rem;
        letter-spacing: 2px;
    }
    
    .button-primary {
        padding: 12px 25px;
        font-size: 1rem;
    }
}
```

## Game-Specific Elements

### Health Bars
- **Above Character**: Positioned above sprites
- **Color States**: Green (healthy), Yellow (damaged), Red (critical)
- **Animation**: Smooth transitions between states

### Chat System
- **Background**: `rgba(0, 0, 0, 0.8)`
- **Border**: `2px solid #d4af37`
- **Font**: `'Courier New', monospace`
- **Message Types**: System (italic), Player (normal)

### Mobile Controls
- **D-pad**: Circular buttons with directional arrows
- **Touch Feedback**: Scale animation on press
- **Accessibility**: Large touch targets, clear visual feedback

## Accessibility Guidelines

### Color Contrast
- **Minimum Ratio**: 4.5:1 for normal text
- **Large Text**: 3:1 for headings
- **Interactive Elements**: Clear focus states

### Keyboard Navigation
- **Tab Order**: Logical sequence through interface
- **Focus Indicators**: Visible outline on focused elements
- **Keyboard Shortcuts**: Consistent across all pages

### Screen Reader Support
- **Alt Text**: Descriptive text for all images
- **ARIA Labels**: Proper labeling for interactive elements
- **Semantic HTML**: Use appropriate HTML elements

## Implementation Guidelines

### CSS Organization
1. **Reset Styles**: `* { margin: 0; padding: 0; box-sizing: border-box; }`
2. **Base Styles**: Typography, colors, layout
3. **Component Styles**: Buttons, forms, modals
4. **Utility Classes**: Spacing, alignment, visibility
5. **Responsive Styles**: Media queries at the end

### Naming Conventions
- **BEM Methodology**: `.block__element--modifier`
- **Semantic Names**: `.menu-button`, `.form-input`, `.modal-content`
- **State Classes**: `.active`, `.disabled`, `.loading`

### Performance Considerations
- **Minimal Animations**: Reduce motion for performance
- **Efficient Selectors**: Avoid deep nesting
- **CSS Variables**: Use for consistent theming
- **Critical CSS**: Inline critical styles for faster loading

## Future Considerations

### Scalability
- **CSS Variables**: For easy theme switching
- **Component Library**: Reusable UI components
- **Design Tokens**: Consistent spacing and sizing
- **Theme Variants**: Light mode, high contrast options

### Maintenance
- **Documentation**: Keep style guide updated
- **Code Reviews**: Ensure style consistency
- **Testing**: Cross-browser compatibility
- **Performance**: Regular optimization audits

---

**Last Updated**: January 27, 2025  
**Version**: 1.0  
**Maintained By**: Development Team
