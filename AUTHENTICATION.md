# Authentication Setup

## Features

✅ Email/Password Authentication
✅ Google OAuth Authentication  
✅ Role-based Access Control (Admin, Teacher, Student)
✅ Protected Routes
✅ Session Management

## Setup Instructions

### 1. Environment Variables

Update your `.env` file with the following:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or in PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. Setup Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy Client ID and Client Secret to `.env`

### 4. Database Migration

The authentication tables have been added to your schema. Run:

```bash
npx prisma db push
npx prisma generate
```

## Usage

### Sign Up

Navigate to `/auth/signup` to create a new account:

- Choose your role (Admin, Teacher, Student)
- Enter email and password
- Or sign up with Google

### Sign In

Navigate to `/auth/signin` to login:

- Use email/password credentials
- Or sign in with Google

### Protecting Routes

Use the `useSession` hook to protect routes:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}
```

### Role-Based Access

Check user role in your components:

```tsx
const { data: session } = useSession();

if (session?.user?.role === "ADMIN") {
  // Show admin content
}

if (session?.user?.role === "TEACHER") {
  // Show teacher content
}

if (session?.user?.role === "STUDENT") {
  // Show student content
}
```

### Sign Out

```tsx
import { signOut } from "next-auth/react";

<button onClick={() => signOut()}>Sign Out</button>;
```

## API Routes

### Sign Up

- **Endpoint**: `POST /api/auth/signup`
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

### Sign In

- **Endpoint**: NextAuth handles this automatically
- Use `signIn("credentials", { email, password })` on client

## User Roles

- **ADMIN**: Full access to all features
- **TEACHER**: Access to teaching-related features
- **STUDENT**: Access to student-related features

## Next Steps

1. Create middleware to protect routes server-side
2. Add role-specific dashboards
3. Link User accounts to existing Teacher/Student records
4. Add password reset functionality
5. Add email verification

## Testing

Test accounts (create these via sign up):

- Admin: admin@test.com
- Teacher: teacher@test.com
- Student: student@test.com
