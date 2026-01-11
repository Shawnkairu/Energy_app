# e.mappa React Native App - Setup Instructions

## What I Built

✅ Sophisticated auth screen with rotating 3D house animation (Tesla-style)
✅ Small, clean typography
✅ Three action buttons: Sign In, Create Account, Continue as Guest
✅ Smooth 20-second rotation loop using React Native Reanimated

## Quick Start - Test on Your Phone (5 minutes)

### 1. Navigate to project
```bash
cd /home/claude/emappa
```

### 2. Start the development server
```bash
npx expo start
```

### 3. On your phone:
- **iOS**: Download "Expo Go" from App Store
- **Android**: Download "Expo Go" from Play Store

### 4. Scan the QR code
- iOS: Use your Camera app
- Android: Use the Expo Go app's scanner

### 5. Watch it load!
The app will appear on your phone in ~30 seconds.

## What You'll See

- Clean light background (#F5F5F7)
- 3D house slowly rotating (full rotation every 20 seconds)
- Blue "Sign In" button with subtle shadow
- "Create Account" text button
- "Continue as Guest" text button
- Small, sophisticated fonts (15px)

## Next Steps

Once you see it on your phone, let me know:
1. What you think of the animation speed (too fast/slow?)
2. Font sizes (too small/large?)
3. Button styling preferences
4. Should we stick with light theme or switch to dark?

Then we can build the next screens!

## Project Structure
```
emappa/
├── src/
│   └── screens/
│       └── AuthScreen.tsx    # The auth screen with animation
├── assets/
│   └── house.png             # Your 3D house image
├── App.tsx                   # Main app entry
└── package.json
```

## Tech Stack
- React Native + TypeScript
- Expo (for easy mobile testing)
- React Native Reanimated (for smooth animations)
