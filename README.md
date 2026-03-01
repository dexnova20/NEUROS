# NeuroAdaptive - Proactive Reading Intelligence Layer

## Overview

NeuroAdaptive is a browser-agnostic accessibility intelligence layer that proactively adapts web content based on real-time friction detection and user preferences.

## Core Features

- **Proactive Adaptation**: Early friction detection with smooth, gradual adjustments
- **Hybrid Intelligence**: AI-driven suggestions with explicit user control
- **Universal Compatibility**: Modular architecture supports Chrome, Firefox, Edge, Safari
- **Privacy-First**: All processing happens locally, no data transmission
- **Zero Flicker**: Instant preference application on page load

## Architecture

### Modular Core
```
/core
  scoring.js          - Platform-agnostic friction detection
  personalization.js  - Universal preference management
  adaptation.js       - State machine and UI adaptation

/browser
  chromeAdapter.js    - Chrome-specific API isolation
```

### Control Hierarchy

1. **User Explicit Preferences** (Highest Priority)
   - Manual adjustments lock parameters from AI override
   - Always respected, never overridden

2. **AI Adaptive Suggestions**
   - Proactive recommendations based on friction signals
   - Requires user confirmation to persist

3. **Default Presets**
   - Low Vision, Dyslexia, High Contrast
   - Starting point for customization

## Proactive Intelligence

### Early Detection
- Normal → Mild: Score > 0.45 (adjusted by AI confidence)
- Mild → High: Score > 0.70 (adjusted by AI confidence)
- Hysteresis bands prevent oscillation

### AI Confidence Learning
- Default: 50%
- Accept suggestion: +5% (max 100%)
- Reject suggestion: -5% (min 10%)
- Higher confidence = earlier, more proactive adaptation

### Smooth Escalation
- 500ms CSS transitions for imperceptible changes
- No page re-render, only CSS variable updates
- Gradual scale/line-height/spacing adjustments

## Friction Detection

### Signals Tracked
- **Scroll Variance**: Erratic scrolling patterns (30% weight)
- **Rage Clicks**: Rapid repeated clicking (25% weight)
- **Re-reading**: Backward scrolling (20% weight)
- **Tab Switching**: Attention fragmentation (15% weight)

### Baseline Calibration
- 20-second initial calibration period
- Filters out false positives
- User-triggered recalibration available

## Adaptive States

| State | Threshold | Scale | Line Height | Background Tint |
|-------|-----------|-------|-------------|-----------------|
| Normal | < 0.45 | 1.0x | 1.5 | None |
| Mild | 0.45-0.70 | 1.08x | 1.7 | rgba(230,240,255,0.15) |
| High | > 0.70 | 1.15x | 1.9 | rgba(220,230,255,0.25) |

## User Experience

### Instant Value
- Preferences load before page render
- Zero layout shift (CLS = 0)
- Deferred panel creation (non-blocking)

### AI Suggestions
- Shown for high friction or high confidence states
- "Keep as Default" / "Revert" options
- 10-second auto-dismiss
- Builds AI confidence through reinforcement

### Transparency
- Control Source indicator (User / AI / Hybrid)
- AI Confidence percentage display
- User Override Active indicator
- Real-time friction metrics

## Installation

1. Load in browser: `chrome://extensions/` or `about:addons`
2. Enable Developer mode
3. Load unpacked extension from `/extension` folder

## Technical Specifications

### Performance
- Initialization: < 100ms
- Adaptation: < 50ms
- Memory: < 5MB
- CPU: < 1% idle

### Stability
- Single authoritative control signal
- 3-second minimum state duration
- Hysteresis prevents oscillation
- No recursive updates

### Browser Support
- Chrome/Edge: Full support (Manifest V3)
- Firefox: Adapter ready
- Safari: Adapter ready

## Privacy & Security

- All data stored locally (browser storage API)
- No external requests (except optional backend)
- No tracking or analytics
- Shadow DOM isolation prevents conflicts

## License

MIT License

---

**Version**: 2.0 Proactive  
**Status**: Production Ready  
**Architecture**: Hybrid Intelligence
