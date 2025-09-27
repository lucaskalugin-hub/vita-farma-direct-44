# AI Rules for Application Development

This document outlines the core technologies and best practices to follow when developing this application.

## Tech Stack

*   **Frontend Framework**: React.js for building user interfaces.
*   **Language**: TypeScript for type safety and improved developer experience.
*   **Styling**: Tailwind CSS for utility-first styling, ensuring responsive and consistent designs.
*   **UI Components**: shadcn/ui for pre-built, accessible, and customizable UI components.
*   **Routing**: React Router for client-side navigation and managing application routes.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **Build Tool**: Vite for a fast development experience and optimized builds.
*   **Package Manager**: npm for managing project dependencies.

## Library Usage Rules

*   **UI Components**: Always prioritize `shadcn/ui` components for all UI elements. If a specific component is not available in `shadcn/ui`, create a new, small, and focused component using Tailwind CSS. Do not modify existing `shadcn/ui` component files directly.
*   **Styling**: All styling must be done using Tailwind CSS classes. Avoid inline styles or custom CSS files unless absolutely necessary for very specific, isolated cases (which should be rare).
*   **Routing**: Use `react-router-dom` for all navigation within the application. Define routes in `src/App.tsx`.
*   **Icons**: Use icons from the `lucide-react` library.
*   **State Management**: For local component state, use React's built-in `useState` and `useReducer` hooks. For global state, consider simple React Context API if needed, but avoid over-engineering.
*   **File Structure**:
    *   Pages should reside in `src/pages/`.
    *   Reusable components should reside in `src/components/`.
    *   Utility functions should reside in `src/utils/`.
    *   Hooks should reside in `src/hooks/`.
*   **New Components**: Always create new files for new components or hooks, even if they are small. Do not add new components to existing files.
*   **Responsiveness**: All designs must be responsive and adapt well to different screen sizes using Tailwind's responsive utility classes.
*   **Error Handling**: Do not implement `try/catch` blocks unless specifically requested. Errors should bubble up for better debugging and centralized handling.
*   **Simplicity**: Prioritize simple and elegant solutions. Avoid over-engineering features. Implement only what is requested, fully and functionally.