# DTU Compute Cluster Frontend

This is the frontend application for the DTU Compute Cluster system, built with Next.js 15, React 18, and TypeScript.

## Features

- **User Authentication**: LDAP-based login system
- **VM Management**: Start, stop, restart, and delete virtual machines
- **Container Management**: Manage LXC containers
- **Remote Desktop**: Optimized Guacamole remote desktop access via popup windows
- **Admin Panel**: User management for administrators
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with DTU branding
- **State Management**: React hooks
- **API Client**: Fetch API with custom hooks

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin_dashboard/    # Admin management interface
│   ├── dashboard/          # Main user dashboard
│   ├── login/             # Login page
│   ├── signup/            # User registration
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── AuthCard.tsx       # Authentication card wrapper
│   ├── Button.tsx         # Custom button component
│   ├── Input.tsx          # Form input component
│   └── ThemeToggle.tsx    # Dark/light mode toggle
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication logic
│   ├── useAuthGuard.ts    # Route protection
│   └── useProxmox.ts      # VM/Container management
├── lib/                   # Utility libraries
│   ├── api/               # API client functions
│   │   ├── admin.ts       # Admin API calls
│   │   ├── auth.ts        # Authentication API
│   │   ├── guacamole.ts   # Remote desktop API
│   │   ├── proxmox.ts     # VM/Container API
│   │   ├── server.ts      # Server status API
│   │   └── users.ts       # User management API
│   └── utils.ts           # Utility functions
├── styles/                # Global styles
│   └── globals.css        # Global CSS with Tailwind
└── types/                 # TypeScript type definitions
    ├── auth.ts            # Authentication types
    ├── components.ts      # Component prop types
    ├── proxmox.ts         # VM/Container types
    └── user.ts            # User data types
```

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

### Authentication
- `POST /auth/login` - LDAP authentication
- `GET /auth/me` - Get current user info

### User Management
- `GET /users/list` - List all users
- `POST /users/create` - Create new user
- `PATCH /users/me/change/password` - Change password
- `DELETE /users/me/delete` - Delete account

### Admin Functions
- `GET /admin/users/list` - Admin list all users
- `POST /admin/users/create` - Admin create user
- `PATCH /admin/{username}/change/group` - Change user group
- `DELETE /admin/{username}/delete` - Delete user

### VM/Container Management
- `GET /proxmox/vms` - List all VMs
- `GET /proxmox/containers` - List all containers
- `POST /proxmox/vms/{node}/{vm_id}/start` - Start VM
- `POST /proxmox/vms/{node}/{vm_id}/stop` - Stop VM
- `POST /proxmox/vms/{node}/{vm_id}/restart` - Restart VM
- `DELETE /proxmox/vms/{node}/{vm_id}/delete` - Delete VM

### Remote Desktop
- `GET /guacamole/token` - Get Guacamole token
- `GET /guacamole/connections` - List connections
- `GET /guacamole/connections/{id}/url` - Get connection URL
- Opens in optimized popup windows for better performance

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends LDAP credentials to backend
3. Backend validates against LDAP server
4. JWT token is returned and stored in localStorage
5. Token is included in all subsequent API requests
6. Token expires after 30 minutes and user is automatically logged out

## Route Protection

The application uses custom hooks for route protection:
- `useRequireAuth` - Protects routes requiring authentication
- `useAdminGuard` - Protects admin-only routes

## Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Building for Production
```bash
npm run build
npm start
```

## Component Usage

### Authentication Components
```tsx
// Login form
import { useLogin } from "@/hooks/useAuth";
const { login, loading, error } = useLogin();

// Route protection
import { useRequireAuth } from "@/hooks/useAuthGuard";
const { isAuthenticated, isLoading } = useRequireAuth();
```

### VM Management
```tsx
import { useVMs } from "@/hooks/useProxmox";
const { vms, loading, startVM, stopVM, restartVM } = useVMs();
```

### UI Components
```tsx
import Button from "@/components/Button";
import Input from "@/components/Input";

<Button variant="red" onClick={handleClick}>
  Delete VM
</Button>

<Input
  type="text"
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

## Styling

The application uses Tailwind CSS with custom DTU brand colors:
- `dtu-corporate-red`: #990000
- `dtu-navy-blue`: #030F4F
- `dtu-blue`: #2F5F8F
- `dtu-grey`: #747474
- `dtu-green`: #009639
- `dtu-orange`: #FF6600

## Error Handling

- API errors are caught and displayed to users
- Authentication errors trigger automatic logout
- Network errors show appropriate error messages
- Form validation prevents invalid submissions

## Docker Deployment

The frontend includes a Dockerfile for containerized deployment:
```bash
docker build -t compute-cluster-frontend .
docker run -p 3000:3000 compute-cluster-frontend
```

## Contributing

1. Create feature branches from main
2. Follow TypeScript best practices
3. Use the existing component patterns
4. Test authentication flows
5. Ensure responsive design
6. Update this README for new features

## Security Considerations

- JWT tokens are stored in localStorage
- API calls include CSRF protection
- Admin routes are protected with role-based access
- Sensitive operations require confirmation
- Automatic logout on token expiration

## Known Issues

- Guacamole URLs may need adjustment for production
- Some VM operations may require polling for status updates
- Mobile view could be improved for complex tables
- Popup blockers may prevent remote desktop windows from opening

## Performance Optimizations

### Guacamole Integration
- Changed from embedded iframe to popup windows to reduce CPU usage
- Popup windows provide better isolation and performance
- Window management controls (focus, close) for better UX
- Fallback options for blocked popups