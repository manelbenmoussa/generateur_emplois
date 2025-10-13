# Clean Architecture - Quick Reference

## Layer Structure

```
API → Services → DTOs → DAOs → Database
```

## Key Rules

**✅ Decoupled (No Prisma imports):**

- DTOs use generic `DatabaseX` types
- Services work with DTOs only

**❌ Coupled (Uses Prisma - OK!):**

- DAOs query database with Prisma

## Examples

### DAO (Uses Prisma)

```typescript
import prisma from "./db";
export async function getSessionsBySchool(schoolId: number) {
  return await prisma.session.findMany({
    where: { subject: { department: { schoolId } } },
  });
}
```

### DTO (NO Prisma)

```typescript
type DatabaseSession = { id: number; subjectId: number };
export interface SessionDto {
  id: number;
  subjectId: number;
}
export function mapSession(raw: DatabaseSession): SessionDto {
  return { id: raw.id, subjectId: raw.subjectId };
}
```

### Service (Uses DTOs)

```typescript
import * as sessionDao from "../dao/sessionDao";
import { mapSession } from "../dto/timeTableDto";

export async function getTimetable(schoolId: number) {
  const raw = await sessionDao.getSessionsBySchool(schoolId);
  return raw.map(mapSession);
}
```

## When Schema Changes

1. Update `schema.prisma`
2. Update DAOs (if queries change)
3. Update `DatabaseX` types in DTOs
4. Services/business logic unchanged ✅

## Benefits

- Easy testing (plain objects, no Prisma mocks)
- Database changes isolated
- Clear separation of concerns
