/**
 * Integration-style test: calls the GET export from the subjects API route.
 * Uses Node environment because it calls the WHATWG Request implementation.
 */
/* @jest-environment node */

// Mock next/server so importing the route file doesn't attempt to use
// the browser WHATWG `Request` implementation at import-time.
jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: (payload: unknown, opts?: any) => ({
      json: async () => payload,
      status: opts?.status ?? 200,
    }),
  },
}));

// Mock Prisma DB so the route's DB calls are deterministic in tests.
jest.mock("@/dao/db", () => ({
  __esModule: true,
  default: {
    subject: {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: async (data: any) => ({ id: 1, ...data }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: async (data: any) => data,
      delete: async () => ({}),
      count: async () => 0,
    },
    session: { count: async () => 0 },
    teacherSubject: { count: async () => 0 },
  },
}));

import { GET, POST, PUT, DELETE } from "@/app/api/subjects/route";

describe("GET /api/subjects", () => {
  test("returns a NextResponse JSON with subjects or an array", async () => {
    // The route only needs an object with a `url` property for this test.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { url: "http://localhost/api/subjects" } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await GET(req);
    expect(res).toBeDefined();
    if (typeof res.json === "function") {
      const body = await res.json();
      expect(body).toBeDefined();
    }
  });

  test("returns empty array when no subjects exist", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { url: "http://localhost/api/subjects" } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await GET(req);
    const body = await res.json();
    // The mock returns [] for findMany
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  test("supports checkName query param for duplicate check", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { url: "http://localhost/api/subjects?checkName=Math" } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await GET(req);
    const body = await res.json();
    // Should return { matches: [...] } when checkName is provided
    expect(body).toHaveProperty("matches");
  });
});

describe("POST /api/subjects", () => {
  test("returns 400 when name is missing", async () => {
    const req = {
      url: "http://localhost/api/subjects",
      json: async () => ({ hourVolume: 2 }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fieldErrors).toBeDefined();
    expect(body.fieldErrors.name).toBeDefined();
  });

  test("returns 400 when hourVolume is missing", async () => {
    const req = {
      url: "http://localhost/api/subjects",
      json: async () => ({ name: "Physics" }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fieldErrors).toBeDefined();
    expect(body.fieldErrors.hourVolume).toBeDefined();
  });

  test("returns 400 when hourVolume is not a positive number", async () => {
    const req = {
      url: "http://localhost/api/subjects",
      json: async () => ({ name: "Physics", hourVolume: -5 }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fieldErrors.hourVolume).toBeDefined();
  });

  test("creates a subject successfully with valid data", async () => {
    const req = {
      url: "http://localhost/api/subjects",
      json: async () => ({ name: "Chemistry", hourVolume: 3 }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
  });
});

describe("PUT /api/subjects", () => {
  test("returns 400 when id is missing", async () => {
    const req = {
      url: "http://localhost/api/subjects",
      json: async () => ({ name: "Biology", hourVolume: 2 }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await PUT(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("id");
  });
});

describe("DELETE /api/subjects", () => {
  test("returns 400 when id query param is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { url: "http://localhost/api/subjects" } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await DELETE(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("id");
  });

  test("returns 404 when subject does not exist", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { url: "http://localhost/api/subjects?id=999" } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await DELETE(req);
    // The mock returns null for findUnique, so route should return 404
    expect(res.status).toBe(404);
  });
});
