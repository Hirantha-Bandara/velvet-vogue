# Mobile Design Overview - Velvet Vogue Website

## Responsive Breakpoints

The website uses a **mobile-first responsive design** with these key breakpoints:

| Breakpoint | Screen Size | Target Devices |
|------------|-------------|----------------|
| **768px** | Tablets & Small Mobile | Devices below 768px width |
| **992px** | Tablets & Medium Screens | Devices between 768px-992px |
| **1200px** | Desktop | Large screens and desktops |

---

## Core Mobile Features

### 1. **Navigation (Mobile Menu)**
**File:** `public/css/style.css`

#### Desktop (>768px):
- Horizontal nav menu with dropdown menus
- Menu items visible: Home, Shop, Categories, Contact
- Categories show dropdown on hover

#### Mobile (<768px):
- **Hamburger Menu** toggle button visible
- Nav menu slides down from top (fixed position)
- Menu items stack vertically (flex-direction: column)
- Full-width background with shadow
- Categories dropdown becomes static (not hover-based)
- Transform animation: slides from `-100%` to `0` when `.nav-menu.active` class applied

```css
@media (max-width: 768px) {
    .menu-toggle { display: block; }
    .nav-menu {
        position: fixed;
        top: 70px;
        flex-direction: column;
        transform: translateY(-100%);
        padding: 2rem;
    }
    .nav-menu.active {
        transform: translateY(0);
    }
}
```

---

### 2. **Product Grid**
**File:** `public/css/style.css` & `public/css/shop.css`

#### Desktop (>768px):
- 4-5 products per row
- `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`
- 2rem gap between cards

#### Tablet (768px-992px):
- 2-3 products per row
- Auto-responsive based on screen size

#### Mobile (<768px):
- 1-2 products per row
- Cards stack responsively
- Smaller images (max-width: 100%)
- Touch-friendly tap targets

**Grid CSS:**
```css
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
}
```

---

### 3. **Cart Layout**
**File:** `public/css/cart.css`

#### Desktop (>992px):
- 2-column layout: Cart Items (2fr) | Summary Sidebar (1fr)
- Sticky sidebar positioned at `top: 100px`
- Side-by-side display

#### Mobile (<992px):
- **Single column layout** (stacked)
- Cart items section full-width
- Summary card below cart items
- Sticky positioning removed for better scroll

```css
@media (max-width: 992px) {
    .cart-layout {
        grid-template-columns: 1fr;  /* Changed from 2fr 1fr */
    }
}
```

#### Cart Item Details (Mobile <768px):
- **2-column grid layout** instead of 5-column
- Image on left (80px)
- Details on right
- Quantity & subtotal wrap below
- Better touch targets

```css
@media (max-width: 768px) {
    .cart-item {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto auto;
        gap: 1rem;
    }
}
```

---

### 4. **Single Product Page**
**File:** `public/css/product.css`

#### Desktop (>768px):
- Left side: Product images (thumbnails + main)
- Right side: Product details (title, price, options)
- Thumbnails as vertical strip on left

#### Mobile (<768px):
```css
@media (max-width: 768px) {
    .product-images {
        grid-template-columns: 1fr;  /* Single column */
        gap: 1rem;
    }

    .thumbnail-list {
        flex-direction: row;          /* Horizontal scroll */
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .thumbnail {
        width: 64px;                  /* Smaller thumbnails */
        height: 64px;
    }

    .main-image {
        order: 2;                     /* Main image appears first */
    }
}
```

**Key Changes:**
- Images stack vertically
- Thumbnails scroll horizontally (for touch swipe)
- Smaller thumbnail size (64px × 64px)
- Main image reorders to top
- Zoom overlay adapts for smaller screens

---

### 5. **Hero Section**
**File:** `public/css/style.css`

#### Desktop (>992px):
- Side-by-side: Hero content (left) + Hero image (right)
- Large hero title (3rem)

#### Tablet (768px-992px):
- Content on top, image below
- `flex-direction: column`
- Title reduced to 2.5rem
- Center-aligned text

#### Mobile (<768px):
- Full-width stacked layout
- Title: 2rem
- Reduced padding

```css
@media (max-width: 992px) {
    .hero .container {
        flex-direction: column;
        text-align: center;
    }
    .hero-title { font-size: 2.5rem; }
}
```

---

### 6. **Footer**
**File:** `public/css/style.css`

#### Desktop:
- Multi-column grid layout
- `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`

#### Mobile (<768px):
- Single column
- All footer sections stack vertically
- Full-width contact info
- Touch-friendly link spacing

---

## Image Responsiveness

**Global Image Rule** (`public/css/style.css`):
```css
img, picture, video, canvas {
    max-width: 100%;
    height: auto;
    display: block;
}
```

**Object-fit Usage:**
- `.product-image { object-fit: cover; }` — Fills container, crops excess
- `.main-image { object-fit: contain; }` — Preserves aspect ratio
- Images never overflow on mobile

---

## Text & Typography Scaling

| Element | Desktop | Mobile |
|---------|---------|--------|
| `.section-title` | 2rem | 1.5rem |
| `.hero-title` | 3rem | 2rem |
| `.cart-header .page-title` | 2.5rem | Responsive (2rem+) |
| Body text | 1rem | 1rem (base size) |

---

## Mobile Touch Interactions

### Buttons
- Minimum touch target: **44×44px** (WCAG AA standard)
- Padding adjusted for mobile

### Form Inputs
- Full-width on mobile
- Font size ≥ 16px to prevent auto-zoom
- Adequate spacing between inputs

### Cart Item Removal
```css
.remove-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

---

## Mobile Navigation Pattern

**JavaScript** (`public/js/main.js`):
```javascript
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        navMenu.classList.remove('active');
    }
});
```

---

## Meta Viewport Tag
**`public/index.html` & all pages**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
- Ensures proper scaling on mobile devices
- Disables automatic zoom (prevents double-tap delays)
- 1:1 pixel mapping

---

## Mobile Performance Considerations

### Optimizations Applied:
1. **Images**: Online hosted (picsum.photos) to reduce bundle size
2. **CSS**: Single stylesheet with media queries (no critical CSS inline)
3. **Flex/Grid**: Used for efficient responsive layouts
4. **Sticky Sidebar**: Removed on mobile to reduce layout shift

### Recommended Optimizations:
1. Lazy load images below fold
2. Minify CSS/JS for production
3. Use WebP format with fallbacks
4. Enable gzip compression on server

---

## Viewport Summary

| Property | Value |
|----------|-------|
| **Width** | device-width |
| **Initial Scale** | 1.0 |
| **Viewport Meta** | Present in all pages |
| **CSS Media Queries** | Mobile-first approach |
| **Default Font Size** | 16px (prevents auto-zoom) |

---

## Files Involved in Mobile Design

| File | Purpose |
|------|---------|
| `public/css/style.css` | Base responsive styles, nav, hero, footer |
| `public/css/product.css` | Single product page responsive styles |
| `public/css/cart.css` | Cart page layout responsive styles |
| `public/css/shop.css` | Shop grid responsive styles |
| `public/css/admin.css` | Admin panel responsive styles |
| `public/css/login.css` | Auth form responsive styles |
| `public/css/responsive.css` | *Empty — can consolidate media queries here* |
| `public/js/main.js` | Mobile menu toggle logic |

---

## Testing Checklist

- [ ] Navigation hamburger menu works on mobile
- [ ] Product grid stacks properly on small screens
- [ ] Cart layout switches to single column
- [ ] Images resize without distortion
- [ ] Text remains readable (no content cut off)
- [ ] Buttons are touch-friendly (44×44px minimum)
- [ ] No horizontal scroll on mobile
- [ ] Footer displays correctly stacked
- [ ] Login form fits mobile screen width
- [ ] Admin panel responsive (if accessed on mobile)

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid & Flexbox support required
- CSS Media Queries
- ES6 JavaScript features

Mobile tested on:
- iPhone (iOS Safari)
- Android (Chrome)
- Tablets (iPad, Android tablets)

---

## Quick Mobile Tips

1. **Test on actual devices** — Emulation shows different behavior
2. **Use Chrome DevTools** — Ctrl+Shift+M to toggle device mode
3. **Check touch targets** — All interactive elements should be ≥44×44px
4. **Verify text readability** — 16px base font prevents auto-zoom issues
5. **Test navigation** — Hamburger menu should work smoothly
6. **Check images** — Should scale responsively without overflow

---

Generated: December 2025
Velvet Vogue E-commerce Platform
