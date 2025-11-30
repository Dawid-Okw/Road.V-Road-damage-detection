# Component Documentation

## Overview

This document provides detailed information about the custom components used in the Road.V frontend application. All UI primitives are from shadcn/ui and are located in `src/components/ui/`.

## Custom Components

### Navigation

**Location:** `src/components/Navigation.tsx`

The main navigation component that appears on all pages.

**Features:**

- Responsive design with mobile menu
- Authentication state awareness
- Active route highlighting
- Sticky positioning

**Usage:**

```tsx
import Navigation from '@/components/Navigation';

<Navigation />;
```

**Props:** None (uses React Router hooks internally)

**Behavior:**

- Shows different navigation items based on authentication state
- Authenticated users see: Home, Product, Statistics, Road Map, Profile, Logout
- Unauthenticated users see: Home, Product, Login
- Mobile menu toggles with hamburger icon

---

### NavLink

**Location:** `src/components/NavLink.tsx`

A styled navigation link component.

**Usage:**

```tsx
import NavLink from '@/components/NavLink';

<NavLink to="/path" active={isActive}>
	Link Text
</NavLink>;
```

**Props:**

- `to: string` - Route path
- `active?: boolean` - Whether the link is currently active
- `children: ReactNode` - Link content

---

## shadcn/ui Components

All components in `src/components/ui/` are from shadcn/ui. Here's a quick reference:

### Layout Components

#### Card

Container component for content sections.

```tsx
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card';

<Card>
	<CardHeader>
		<CardTitle>Title</CardTitle>
		<CardDescription>Description</CardDescription>
	</CardHeader>
	<CardContent>Content goes here</CardContent>
	<CardFooter>Footer content</CardFooter>
</Card>;
```

#### Separator

Visual divider between content sections.

```tsx
import { Separator } from "@/components/ui/separator";

<Separator />
<Separator orientation="vertical" />
```

#### Tabs

Tabbed interface for organizing content.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
	<TabsList>
		<TabsTrigger value="tab1">Tab 1</TabsTrigger>
		<TabsTrigger value="tab2">Tab 2</TabsTrigger>
	</TabsList>
	<TabsContent value="tab1">Content 1</TabsContent>
	<TabsContent value="tab2">Content 2</TabsContent>
</Tabs>;
```

#### Accordion

Collapsible content sections.

```tsx
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';

<Accordion type="single" collapsible>
	<AccordionItem value="item-1">
		<AccordionTrigger>Section 1</AccordionTrigger>
		<AccordionContent>Content 1</AccordionContent>
	</AccordionItem>
</Accordion>;
```

### Form Components

#### Button

Primary action component.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

#### Input

Text input field.

```tsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

#### Label

Form field label.

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

#### Textarea

Multi-line text input.

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter description..." rows={4} />;
```

#### Select

Dropdown selection component.

```tsx
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

<Select>
	<SelectTrigger>
		<SelectValue placeholder="Select option" />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="option1">Option 1</SelectItem>
		<SelectItem value="option2">Option 2</SelectItem>
	</SelectContent>
</Select>;
```

#### Checkbox

Boolean input component.

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>
```

#### Radio Group

Single selection from multiple options.

```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup defaultValue="option1">
	<div className="flex items-center space-x-2">
		<RadioGroupItem value="option1" id="option1" />
		<Label htmlFor="option1">Option 1</Label>
	</div>
	<div className="flex items-center space-x-2">
		<RadioGroupItem value="option2" id="option2" />
		<Label htmlFor="option2">Option 2</Label>
	</div>
</RadioGroup>;
```

#### Switch

Toggle switch component.

```tsx
import { Switch } from '@/components/ui/switch';

<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />;
```

#### Slider

Range input component.

```tsx
import { Slider } from '@/components/ui/slider';

<Slider defaultValue={[50]} max={100} step={1} />;
```

#### Form

Form wrapper with validation (React Hook Form integration).

```tsx
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const form = useForm();

<Form {...form}>
	<form onSubmit={form.handleSubmit(onSubmit)}>
		<FormField
			control={form.control}
			name="username"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Username</FormLabel>
					<FormControl>
						<Input {...field} />
					</FormControl>
					<FormDescription>Your public username</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	</form>
</Form>;
```

### Feedback Components

#### Alert

Display important messages.

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>Important information here.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

#### Toast

Temporary notification messages.

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
	title: 'Success',
	description: 'Operation completed successfully',
});

toast({
	variant: 'destructive',
	title: 'Error',
	description: 'Something went wrong',
});
```

#### Badge

Small status indicator.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Progress

Progress indicator.

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={60} />;
```

#### Skeleton

Loading placeholder.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />
```

### Overlay Components

#### Dialog

Modal dialog.

```tsx
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
	<DialogTrigger asChild>
		<Button>Open Dialog</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Dialog Title</DialogTitle>
			<DialogDescription>Dialog description</DialogDescription>
		</DialogHeader>
		<div>Dialog content</div>
	</DialogContent>
</Dialog>;
```

#### Alert Dialog

Confirmation dialog.

```tsx
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
	<AlertDialogTrigger asChild>
		<Button variant="destructive">Delete</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription>
				This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>Continue</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>;
```

#### Sheet

Side panel overlay.

```tsx
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

<Sheet>
	<SheetTrigger asChild>
		<Button>Open Sheet</Button>
	</SheetTrigger>
	<SheetContent>
		<SheetHeader>
			<SheetTitle>Sheet Title</SheetTitle>
			<SheetDescription>Sheet description</SheetDescription>
		</SheetHeader>
		<div>Sheet content</div>
	</SheetContent>
</Sheet>;
```

#### Popover

Floating content container.

```tsx
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

<Popover>
	<PopoverTrigger asChild>
		<Button>Open Popover</Button>
	</PopoverTrigger>
	<PopoverContent>Popover content</PopoverContent>
</Popover>;
```

#### Tooltip

Hover information.

```tsx
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
	<Tooltip>
		<TooltipTrigger>Hover me</TooltipTrigger>
		<TooltipContent>
			<p>Tooltip content</p>
		</TooltipContent>
	</Tooltip>
</TooltipProvider>;
```

#### Hover Card

Rich hover content.

```tsx
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';

<HoverCard>
	<HoverCardTrigger>Hover me</HoverCardTrigger>
	<HoverCardContent>Rich content here</HoverCardContent>
</HoverCard>;
```

#### Dropdown Menu

Context menu with actions.

```tsx
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
	<DropdownMenuTrigger asChild>
		<Button>Open Menu</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuLabel>My Account</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuItem>Profile</DropdownMenuItem>
		<DropdownMenuItem>Settings</DropdownMenuItem>
		<DropdownMenuItem>Logout</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>;
```

### Data Display Components

#### Table

Data table component.

```tsx
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

<Table>
	<TableCaption>A list of items</TableCaption>
	<TableHeader>
		<TableRow>
			<TableHead>Column 1</TableHead>
			<TableHead>Column 2</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>Data 1</TableCell>
			<TableCell>Data 2</TableCell>
		</TableRow>
	</TableBody>
</Table>;
```

#### Avatar

User avatar component.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
	<AvatarImage src="/avatar.jpg" alt="User" />
	<AvatarFallback>UN</AvatarFallback>
</Avatar>;
```

#### Calendar

Date picker component.

```tsx
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar mode="single" selected={date} onSelect={setDate} />;
```

#### Carousel

Image/content carousel.

```tsx
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

<Carousel>
	<CarouselContent>
		<CarouselItem>Item 1</CarouselItem>
		<CarouselItem>Item 2</CarouselItem>
		<CarouselItem>Item 3</CarouselItem>
	</CarouselContent>
	<CarouselPrevious />
	<CarouselNext />
</Carousel>;
```

## Best Practices

### Component Composition

Compose components for reusability:

```tsx
// Good
const DamageCard = ({ damage }) => (
	<Card>
		<CardHeader>
			<CardTitle>{damage.type}</CardTitle>
		</CardHeader>
		<CardContent>
			<Badge>{damage.severity}</Badge>
		</CardContent>
	</Card>
);

// Use it
<DamageCard damage={damageData} />;
```

### Accessibility

All shadcn/ui components are accessible by default:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Styling

Use Tailwind CSS classes for styling:

```tsx
<Button className="bg-cyan hover:bg-cyan/90">Custom Styled Button</Button>
```

### Variants

Use component variants for different styles:

```tsx
<Button variant="outline" size="lg">
	Large Outline Button
</Button>
```

## Adding New Components

To add a new shadcn/ui component:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

This will automatically add the component to `src/components/ui/`.
