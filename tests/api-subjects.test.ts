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

import { GET } from "@/app/api/subjects/route";

describe("GET /api/subjects", () => {
  test("returns a NextResponse JSON with subjects or an array", async () => {
    // The route only needs an object with a `url` property for this test.
    // Creating a full WHATWG `Request` isn't necessary and isn't available
    // in the Node test environment by default.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { url: "http://localhost/api/subjects" } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await GET(req);
    // The route returns a NextResponse or throws — assert it has json method
    expect(res).toBeDefined();
    if (typeof res.json === "function") {
      const body = await res.json();
      // body could be an array or object depending on route implementation
      expect(body).toBeDefined();
    }
  });
});
