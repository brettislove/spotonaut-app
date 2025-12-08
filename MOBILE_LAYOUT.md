# Mobile Analysis Results Layout

## Overview

The mobile analysis results view uses a modern **bottom sheet with tabs** interface, providing an intuitive single-scroll experience that mimics popular mapping applications like Google Maps and Apple Maps.

## Layout Structure

```
┌─────────────────────────────┐
│   Fixed Map Area (60vh)     │  ← Always visible, non-scrollable
│                             │
│   [Location Pin & Context]  │
│                             │
├─────────────────────────────┤
│       ═════ Handle          │  ← Drag handle for resizing
├─────────────────────────────┤
│  📊 Metriky  |  💬 Chat     │  ← Tab bar (sticky)
├─────────────────────────────┤
│                             │
│   Scrollable Content        │  ← Single scroll region
│   (40vh - expandable)       │     Metrics cards OR chat
│                             │
└─────────────────────────────┘
```

## Features

### 1. **Responsive Map Area**
- **Collapsed State (40vh sheet)**: Map takes 60% of viewport
- **Expanded State (80vh sheet)**: Map shrinks to 20% with compact metrics badge
- Smooth transitions between states
- Map remains visible for context at all times

### 2. **Bottom Sheet Behavior**
- **Drag Handle**: Users can drag to resize (40vh ↔ 80vh)
- **Two Snap Points**: 
  - 40vh (default) - Shows preview of content
  - 80vh (expanded) - Full content view
- **Spring Physics**: Natural, iOS-like feel
- **Non-modal**: Doesn't block interaction with map

### 3. **Tab Interface**
- **Metriky Tab**:
  - Location header with "Nová" button
  - Three metric cards (Locality Score, Footfall, Hours)
  - Large numbers with gradient backgrounds
  - Progress bars with smooth animations
  - Helpful info callout

- **Chat Tab**:
  - Empty state with friendly prompt
  - Message bubbles (user = gradient, AI = slate)
  - Timestamps
  - Loading indicator with animated dots
  - Input field sticky at bottom of sheet

### 4. **Single Scroll Region**
- Only the bottom sheet content scrolls
- Map is fixed (no competing scroll areas)
- Smooth momentum scrolling
- Custom scrollbar styling
- Overscroll containment (no rubber-banding)

### 5. **Desktop Fallback**
- Automatically detects screen width < 768px
- Desktop view remains unchanged (side-by-side layout)
- Progressive enhancement approach

## Implementation Details

### Components

1. **`AnalysisResultsMobile`** (`/components/analysis-results-mobile.tsx`)
   - Main mobile results container
   - Integrates Vaul drawer
   - Manages tab state
   - Handles map size transitions

2. **`ChatInterface`** (`/components/chat-interface.tsx`)
   - Detects mobile vs desktop
   - Routes to appropriate view
   - Manages analysis state

### Dependencies

- **vaul** (^1.1.2): Bottom sheet/drawer component
  - Accessible, performant
  - Native iOS-like gestures
  - Zero dependencies beyond React

### Styling

Custom CSS in `/app/globals.css`:
- Vaul-specific styles for smooth animations
- Custom scrollbar for dark theme
- Overscroll behavior controls

## User Interactions

### Touch Gestures
- **Drag handle up**: Expand sheet to 80vh
- **Drag handle down**: Collapse sheet to 40vh
- **Swipe down on content**: Collapse (if scrolled to top)
- **Tap tab**: Switch between Metrics/Chat
- **Scroll content**: Independent vertical scroll

### States
1. **Initial Load**: Shows Metrics tab at 40vh
2. **User Expands**: Map shrinks, content expands to 80vh
3. **Tab Switch**: Content changes, scroll position resets
4. **New Analysis**: Returns to collapsed Metrics tab

## Benefits

✅ **Single Scroll Region**: No competing scroll contexts  
✅ **Map Always Visible**: Maintains spatial context  
✅ **Familiar Pattern**: Users understand bottom sheet from other apps  
✅ **Performance**: GPU-accelerated transforms, smooth 60fps  
✅ **Accessibility**: Vaul handles ARIA, keyboard navigation  
✅ **Mobile-First**: Optimized for touch, thumb zones  

## Browser Support

- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Firefox Mobile 90+
- ✅ Samsung Internet 14+

## Future Enhancements

- [ ] Haptic feedback on drag/snap
- [ ] Gesture to dismiss sheet completely
- [ ] Swipe between tabs (horizontal gesture)
- [ ] Remember user's preferred sheet height
- [ ] Offline support for cached analysis results
