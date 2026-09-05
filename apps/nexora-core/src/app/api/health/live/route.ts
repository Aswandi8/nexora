export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(
    {
      status: "ok",
      service: "nexora-core",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
