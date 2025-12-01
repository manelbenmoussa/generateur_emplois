# Clean Architecture - Quick Reference

## Overview
Functional/modular Clean Architecture implementation for TypeScript. No OOP classes, just functions and types.

## Architecture Layers

```
API Routes (app/api/*) 
    ↓
Services (services/*) - Business logic with DTOs
    ↓
DTOs (dto/*) - Map Database types → Domain types (NO Prisma imports)
    ↓
DAOs (dao/*) - Database queries with Prisma
    ↓
Database (Prisma Schema)
```

## Layer Responsibilities

### 1. Database Layer (Prisma Schema)

**Location:** `prisma/schema.prisma`

**Responsibility:**

- Define database structure
- Manage relationships and constraints
- Handle migrations

**Key Point:** This is the ONLY place where actual database schema is defined.

```prisma
model Subject {
  id              Int       @id @default(autoincrement())
  name            String
  hourVolume      Decimal   @map("hour_volume")
  department      Department @relation(fields: [departmentId], references: [id])
  departmentId    Int       @map("department_id")
}
```

---

### 2. DAO Layer (Data Access Objects)

**Location:** `dao/*.ts` files

**Responsibility:**

- Query the database using Prisma
- Return raw database results
- Handle data persistence

**Key Point:** DAOs are SUPPOSED to know about Prisma and the database. This is their job.

**Example:** `dao/sessionDao.ts`

```typescript
import prisma from "./db";

export async function getSessionsBySchool(schoolId: number) {
  return await prisma.session.findMany({
    where: {
      subject: {
        department: {
          schoolId,
        },
      },
    },
    include: {
      teacher: true,
      subject: true,
      groups: {
        include: {
          group: true,
        },
      },
    },
  });
}
```

**✅ Notice:**

- Uses `prisma` directly
- Returns Prisma types
- Contains database-specific queries

---

### 3. DTO Layer (Data Transfer Objects)

**Location:** `dto/timeTableDto.ts`

**Responsibility:**

- Define generic database types (not Prisma-specific)
- Map database results to domain DTOs
- Decouple upper layers from database implementation

**Key Point:** This layer **does NOT** import Prisma types. It uses generic TypeScript types.

**Example:**

```typescript
// ❌ BEFORE (Coupled to Prisma)
import type { Session, Teacher } from "@prisma/client";

export function mapSession(raw: Session): SessionDto {
  return { id: raw.id, subjectId: raw.subjectId };
}

// ✅ AFTER (Decoupled)
type DatabaseSession = {
  id: number;
  subjectId: number;
  teacherId?: number | null;
  groups?: Array<{ group: { id: number } }>;
};

export function mapSession(raw: DatabaseSession): SessionDto {
  const groupIds = raw.groups?.map((g) => g.group.id) || [];
  return {
    id: raw.id,
    subjectId: raw.subjectId,
    teacherId: raw.teacherId,
    groupId: groupIds[0] || null,
    groupIds: groupIds.length > 0 ? groupIds : undefined,
  };
}
```

**Benefits:**

- Upper layers don't depend on Prisma
- Easy to test with plain objects
- Database changes isolated to DAO + Schema

---

### 4. Business Logic Layer (Services)

**Location:** `services/*.ts` files

**Responsibility:**

- Implement core business logic
- Orchestrate data from multiple DAOs
- Transform data using DTOs
- Apply business rules and algorithms

**Key Point:** Services work with DTOs, not database types.

**Example:** `services/timetableService.ts`

```typescript
import * as sessionDao from "../dao/sessionDao";
import { mapSession, SessionDto } from "../dto/timeTableDto";

export async function getTimetableData(schoolId: number) {
  // 1. Get data from DAO (database-specific)
  const sessionsRaw = await sessionDao.getSessionsBySchool(schoolId);

  // 2. Map to DTOs (decoupled from database)
  const sessions: SessionDto[] = sessionsRaw.map(mapSession);

  // 3. Apply business logic
  return processSchedule(sessions);
}
```

**Example:** `services/greedyScheduler.ts`

```typescript
export function scheduleSession(
  session: SessionDto,
  groups: Record<number, GroupDto>,
  teachers: Record<number, TeacherDto>,
  rooms: Record<number, RoomDto>
) {
  // Pure business logic - no database knowledge
  // Works with DTOs only
}
```

---

### 5. Presentation Layer (API Routes)

**Location:** `app/api/*/route.ts`

**Responsibility:**

- Handle HTTP requests/responses
- Call services
- Return JSON responses

**Example:** `app/api/generate-timetable/route.ts`

```typescript
import { generateTimetable } from "@/services/timetableService";

export async function POST(request: Request) {
  const { schoolId } = await request.json();
  const result = await generateTimetable(schoolId);
  return Response.json(result);
}
```

---

## What Gets Decoupled?

### ✅ Decoupled (Don't Know About Database)

1. **DTOs** - Use generic `DatabaseX` types
2. **Services** - Work with DTOs only
3. **API Routes** - Work with services
4. **Algorithms** - Work with DTOs

### ❌ Coupled (Know About Database - This is OK!)

1. **Prisma Schema** - IS the database
2. **DAOs** - Their job is to query the database
3. **Database Migrations** - Manage schema changes

---

## Benefits of This Architecture

### 1. **Easy to Test**

```typescript
// Before: Need to mock Prisma
const mockSession: Session = {
  /* complex Prisma type */
};

// After: Use plain objects
const mockSession: DatabaseSession = { id: 1, subjectId: 1 };
```

### 2. **Database Changes Isolated**

When database schema changes:

- ✅ Update `schema.prisma`
- ✅ Update DAOs if queries change
- ✅ Update generic `DatabaseX` types if needed
- ❌ DTOs mappers usually unchanged
- ❌ Services unchanged
- ❌ Business logic unchanged

### 3. **Clear Separation of Concerns**

- Each layer has a single responsibility
- Easy to understand data flow
- Easy to locate bugs

### 4. **Flexible**

- Could swap Prisma for another ORM
- Only DAOs would need rewriting
- Rest of the code unchanged

---

## Example: Adding a New Field

### Scenario: Add `priority` field to Session

#### Step 1: Update Database Schema

```prisma
// prisma/schema.prisma
model Session {
  id        Int     @id
  priority  Int?    // NEW FIELD
  // ... other fields
}
```

#### Step 2: Run Migration

```bash
npx prisma migrate dev --name add_session_priority
```

#### Step 3: Update DAO (if needed)

```typescript
// dao/sessionDao.ts
// No changes needed if using include: true
```

#### Step 4: Update Generic Type

```typescript
// dto/timeTableDto.ts
type DatabaseSession = {
  id: number;
  priority?: number | null; // NEW FIELD
  // ... other fields
};
```

#### Step 5: Update DTO & Mapper

```typescript
// dto/timeTableDto.ts
export interface SessionDto {
  id: number;
  priority?: number | null; // NEW FIELD
  // ... other fields
}

export function mapSession(raw: DatabaseSession): SessionDto {
  return {
    id: raw.id,
    priority: raw.priority, // NEW FIELD
    // ... other fields
  };
}
```

#### Step 6: Services & Business Logic

```typescript
// services/greedyScheduler.ts
// Use the new priority field if needed
if (session.priority && session.priority > 5) {
  // Schedule high-priority sessions first
}
```

**✅ Result:** Clean, isolated changes at each layer!

---

## Functional vs OOP Approach

### Why Functional/Modular?

**Traditional OOP (Not Used Here):**

```typescript
class SessionRepository {
  async findBySchool(schoolId: number): Promise<Session[]> {}
}

class SessionService {
  constructor(private repo: SessionRepository) {}
  async getSessions(schoolId: number) {}
}
```

**Our Functional Approach (Used Here):**

```typescript
// dao/sessionDao.ts
export async function getSessionsBySchool(schoolId: number) {}

// services/timetableService.ts
export async function generateTimetable(schoolId: number) {
  const sessions = await sessionDao.getSessionsBySchool(schoolId);
}
```

**Advantages:**

- ✅ Simpler - No boilerplate classes
- ✅ More idiomatic for TypeScript/JavaScript
- ✅ Easier to understand and maintain
- ✅ Better tree-shaking for Next.js
- ✅ Less ceremony, more clarity

---

## Key Principles

### 1. Dependency Direction

```
API → Services → DTOs → DAOs → Database
```

- Upper layers depend on lower layers
- Lower layers don't know about upper layers

### 2. Data Flow

```
Database → DAOs → DTOs (mapping) → Services → API
```

- Data enters through DAOs (Prisma types)
- Gets mapped to DTOs (generic types)
- Services work with DTOs
- API returns DTOs as JSON

### 3. Separation of Concerns

- **DAOs:** "How to get data from database"
- **DTOs:** "What shape data should have"
- **Services:** "What to do with the data"
- **APIs:** "How to expose the functionality"

---

## Testing Strategy

### Unit Tests (Easy with Decoupling)

```typescript
// Test mapper without database
describe("mapSession", () => {
  it("should map database session to DTO", () => {
    const dbSession: DatabaseSession = {
      id: 1,
      subjectId: 5,
      groups: [{ group: { id: 10 } }],
    };

    const dto = mapSession(dbSession);

    expect(dto.id).toBe(1);
    expect(dto.groupId).toBe(10);
  });
});
```

### Integration Tests (With Database)

```typescript
// Test DAO with test database
describe("sessionDao", () => {
  it("should fetch sessions by school", async () => {
    const sessions = await getSessionsBySchool(1);
    expect(sessions.length).toBeGreaterThan(0);
  });
});
```

---

## Summary

✅ **What We Achieved:**

- Clean separation between database and business logic
- Easy to test without mocking Prisma
- Database changes isolated to specific layers
- Clear, maintainable code structure
- Functional approach well-suited for TypeScript

✅ **What We Maintain:**

- DAOs still use Prisma (their job!)
- Database schema in one place (Prisma)
- Type safety throughout the stack

✅ **Result:**
A clean, maintainable architecture that's easy to understand, test, and evolve! 🎯
