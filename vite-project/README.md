# Dog Studio Clone

A React + Vite portfolio landing page inspired by Dog Studio.

This project uses a fullscreen scroll experience with an interactive 3D dog model rendered in `three.js` via `@react-three/fiber` and `@react-three/drei`.

## Features

- 3D dog model with animated entrance and scroll-driven camera movement
- Custom matcap shader transitions on hover over project titles
- GSAP ScrollTrigger animation and interactivity
- Responsive full-page layout with background image grid and content sections
- Built with React 19, Vite, Three.js, GSAP, and React Three Fiber

## Getting started

```bash
cd vite-project
npm install
npm run dev
```

Open the local development server at `http://localhost:5173`.

## Scripts

- `npm run dev` - start Vite development server
- `npm run build` - build production assets
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint across the project

## Project structure

- `src/App.jsx` - main page layout and DOM structure
- `src/components/dog.jsx` - 3D scene setup, GLTF model loading, GSAP animations, and hover interactions
- `public/` - static assets including textures, images, and 3D model files

## Dependencies

- `react`, `react-dom`
- `@react-three/fiber`
- `@react-three/drei`
- `three`
- `gsap`
- `@gsap/react`

## Notes

The app uses a mix of standard React layout and a fixed `<Canvas>` for the 3D experience. Interactive hover states are mapped to title elements to update the model's matcap textures dynamically.
