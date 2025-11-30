# Frontend Documentation

## Overview

Road.V is a modern web application for road damage detection and analysis, built with React, TypeScript, and Vite. The application provides an intuitive interface for viewing, analyzing, and managing road infrastructure issues detected through computer vision and drone-based imagery.

## Tech Stack

### Core Technologies

- **React 18.3** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **React Router 6.30** - Client-side routing

### UI Framework

- **shadcn/ui** - Accessible component library built on Radix UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### State Management & Data Fetching

- **TanStack Query (React Query) 5.83** - Server state management
- **React Hook Form 7.61** - Form state management
- **Zod 3.25** - Schema validation

### Backend Integration

- **Supabase 2.86** - Backend-as-a-Service (authentication, database, storage)
- **Leaflet 1.9** - Interactive maps

## Project Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── Navigation.tsx  # Main navigation component
│   └── NavLink.tsx     # Navigation link component
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Mobile detection hook
│   └── use-toast.ts    # Toast notification hook
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
│   └── utils.ts        # Helper utilities
├── pages/              # Page components (routes)
│   ├── Landing.tsx     # Landing page
│   ├── Auth.tsx        # Authentication page
│   ├── Product.tsx     # Product showcase
│   ├── Statistics.tsx  # Analytics dashboard
│   ├── MapView.tsx     # Interactive map view
│   ├── Profile.tsx     # User profile
│   ├── PotholeDetails.tsx    # Pothole details view
│   ├── CrackDetails.tsx      # Crack details view
│   ├── VideoProcessing.tsx   # Video processing demo
│   ├── DataCleanup.tsx       # Data management
│   └── NotFound.tsx    # 404 page
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **bun**

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Building for Production

Build the application:

```bash
npm run build
```

Build for development mode (with source maps):

```bash
npm run build:dev
```

Preview the production build:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Key Features

### 1. Authentication

- User registration and login via Supabase Auth
- Session management with automatic token refresh
- Protected routes for authenticated users

### 2. Road Damage Visualization

- Interactive map view with Leaflet
- Detailed views for potholes and cracks
- Image galleries with damage classifications

### 3. Analytics Dashboard

- Real-time statistics and metrics
- Data visualization with Recharts
- Filtering and sorting capabilities

### 4. Video Processing

- Demo interface for video-based damage detection
- Integration with backend processing pipeline

### 5. Data Management

- Data cleanup and maintenance tools
- Bulk operations on damage records

## Routing

The application uses React Router for client-side routing:

| Route           | Component       | Description         | Auth Required |
| --------------- | --------------- | ------------------- | ------------- |
| `/`             | Landing         | Landing page        | No            |
| `/auth`         | Auth            | Login/Register      | No            |
| `/product`      | Product         | Product showcase    | No            |
| `/statistics`   | Statistics      | Analytics dashboard | Yes           |
| `/map`          | MapView         | Interactive map     | Yes           |
| `/potholes`     | PotholeDetails  | Pothole details     | Yes           |
| `/cracks`       | CrackDetails    | Crack details       | Yes           |
| `/video-demo`   | VideoProcessing | Video processing    | Yes           |
| `/profile`      | Profile         | User profile        | Yes           |
| `/data-cleanup` | DataCleanup     | Data management     | Yes           |

## Styling

### Tailwind CSS

The project uses Tailwind CSS with a custom configuration:

- **Custom Colors**: Navy, cyan, amber color palettes
- **Custom Shadows**: Soft shadows and glow effects
- **Custom Gradients**: Hero, card, and accent gradients
- **Typography**: Space Grotesk (sans) and Space Mono (mono) fonts

### Theme Variables

CSS variables are defined in `src/index.css` for consistent theming:

```css
--primary: Navy dark
--cyan: Accent color
--amber: Warning/highlight color
--background: Main background
--foreground: Text color
```

### Component Library

All UI components are from shadcn/ui, which provides:

- Accessible components built on Radix UI
- Customizable with Tailwind CSS
- Type-safe with TypeScript
- Located in `src/components/ui/`

## State Management

### TanStack Query (React Query)

Used for server state management:

```typescript
const queryClient = new QueryClient();

// Example usage in components
const { data, isLoading, error } = useQuery({
	queryKey: ['damages'],
	queryFn: fetchDamages,
});
```

### React Hook Form

Used for form state management:

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```

## API Integration

### Supabase Client

The Supabase client is configured in `src/integrations/supabase/client.ts`:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Authentication
await supabase.auth.signIn({ email, password });

// Database queries
const { data, error } = await supabase.from('table_name').select('*');

// Storage
await supabase.storage.from('bucket').upload('path', file);
```

## Custom Hooks

### use-mobile.tsx

Detects mobile viewport:

```typescript
const isMobile = useMobile();
```

### use-toast.ts

Toast notifications:

```typescript
const { toast } = useToast();

toast({
	title: 'Success',
	description: 'Operation completed',
});
```

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices (hooks, functional components)
- Use meaningful component and variable names
- Keep components small and focused
- Extract reusable logic into custom hooks

### Component Structure

```typescript
import { FC } from 'react';

interface ComponentProps {
  // Props definition
}

const Component: FC<ComponentProps> = ({ prop }) => {
  // Component logic

  return (
    // JSX
  );
};

export default Component;
```

### File Naming

- Components: PascalCase (e.g., `Navigation.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Hooks: camelCase with `use` prefix (e.g., `use-mobile.tsx`)
- Pages: PascalCase (e.g., `Landing.tsx`)

### Import Aliases

The project uses `@/` as an alias for the `src/` directory:

```typescript
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
```

## Performance Optimization

- **Code Splitting**: React Router handles automatic code splitting by route
- **Lazy Loading**: Use React.lazy() for heavy components
- **Image Optimization**: Use appropriate image formats and sizes
- **Memoization**: Use React.memo, useMemo, and useCallback where appropriate

## Browser Support

The application supports modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Change port in vite.config.ts or kill the process using port 8080
```

**Module not found:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection issues:**

- Verify environment variables in `.env`
- Check Supabase project status
- Ensure API keys are correct

**Build errors:**

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes locally
5. Submit a pull request

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
