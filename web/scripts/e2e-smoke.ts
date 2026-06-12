/**
 * Smoke test: auth, paginated cards API, CRUD, studied progress.
 * Run: npx tsx scripts/e2e-smoke.ts [baseUrl]
 */
const base = process.argv[2]?.replace(/\/$/, "") || "http://localhost:3000";

async function main(): Promise<void> {
  const jar = new Map<string, string>();
  const testEmail = `e2e-${Date.now()}@example.com`;
  const testPassword = "testpass123";

  function storeCookies(res: Response): void {
    const raw = res.headers.getSetCookie?.() ?? [];
    for (const line of raw) {
      const part = line.split(";")[0];
      const eq = part.indexOf("=");
      if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1));
    }
  }

  function cookieHeader(): string {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async function get(path: string): Promise<Response> {
    const headers: Record<string, string> = {};
    const c = cookieHeader();
    if (c) headers.Cookie = c;
    const res = await fetch(`${base}${path}`, { headers });
    storeCookies(res);
    return res;
  }

  async function post(path: string, body: unknown): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const c = cookieHeader();
    if (c) headers.Cookie = c;
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    storeCookies(res);
    return res;
  }

  async function patch(path: string, body: unknown): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const c = cookieHeader();
    if (c) headers.Cookie = c;
    const res = await fetch(`${base}${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    storeCookies(res);
    return res;
  }

  async function del(path: string): Promise<Response> {
    const headers: Record<string, string> = {};
    const c = cookieHeader();
    if (c) headers.Cookie = c;
    const res = await fetch(`${base}${path}`, { method: "DELETE", headers });
    storeCookies(res);
    return res;
  }

  async function signIn(email: string, password: string): Promise<void> {
    const csrfRes = await get("/api/auth/csrf");
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    const res = await fetch(`${base}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeader(),
      },
      body: new URLSearchParams({
        csrfToken,
        email,
        password,
        redirect: "false",
        json: "true",
      }),
      redirect: "manual",
    });
    storeCookies(res);
    if (!res.ok && res.status !== 302) {
      throw new Error(`Sign-in failed: ${res.status}`);
    }
  }

  const checks: { name: string; ok: boolean; detail: string }[] = [];

  const home = await get("/");
  const homeHtml = await home.text();
  checks.push({
    name: "GET /",
    ok: home.ok && homeHtml.includes("deck-controls"),
    detail: `status ${home.status}`,
  });

  const registerRes = await post("/api/auth/register", {
    email: testEmail,
    password: testPassword,
    name: "E2E",
  });
  checks.push({
    name: "POST /api/auth/register",
    ok: registerRes.status === 201,
    detail: `status ${registerRes.status}`,
  });

  await signIn(testEmail, testPassword);

  const cardsRes = await get("/api/cards?page=1&pageSize=10");
  const cardsJson = (await cardsRes.json()) as {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: { domId: string; head: string }[];
  };
  checks.push({
    name: "GET /api/cards (paginated)",
    ok:
      cardsRes.ok &&
      cardsJson.items.length > 0 &&
      typeof cardsJson.totalItems === "number" &&
      typeof cardsJson.totalPages === "number",
    detail: `${cardsJson.totalItems} total, page ${cardsJson.page}`,
  });

  const createRes = await post("/api/cards", {
    head: "E2E Testwort /eːtˈoː/",
    gloss: ["e2e test gloss"],
    tags: ["user"],
    level: "A1",
  });
  const created = (await createRes.json()) as { domId: string };
  checks.push({
    name: "POST /api/cards",
    ok: createRes.status === 201 && Boolean(created.domId),
    detail: `status ${createRes.status}`,
  });

  const cardId = created.domId;
  if (!cardId) throw new Error("No card id from create");

  const mark = await patch(`/api/cards/${encodeURIComponent(cardId)}/progress`, {
    studied: true,
  });
  checks.push({
    name: "PATCH progress (mark studied)",
    ok: mark.status === 204,
    detail: `status ${mark.status}`,
  });

  const cardRes = await get(`/api/cards/${encodeURIComponent(cardId)}`);
  const cardJson = (await cardRes.json()) as { studied?: boolean };
  checks.push({
    name: "GET /api/cards/[id] studied flag",
    ok: cardRes.ok && cardJson.studied === true,
    detail: `studied=${cardJson.studied}`,
  });

  const updateRes = await patch(`/api/cards/${encodeURIComponent(cardId)}`, {
    gloss: ["updated gloss"],
  });
  checks.push({
    name: "PATCH /api/cards/[id]",
    ok: updateRes.ok,
    detail: `status ${updateRes.status}`,
  });

  const deleteRes = await del(`/api/cards/${encodeURIComponent(cardId)}`);
  checks.push({
    name: "DELETE /api/cards/[id]",
    ok: deleteRes.status === 204,
    detail: `status ${deleteRes.status}`,
  });

  const communityRes = await get("/api/cards?page=1&pageSize=1");
  const communityJson = (await communityRes.json()) as {
    items: { domId: string; isCommunity?: boolean }[];
  };
  const communityCard = communityJson.items.find((c) => c.isCommunity);
  if (communityCard) {
    const forkRes = await patch(
      `/api/cards/${encodeURIComponent(communityCard.domId)}`,
      { gloss: ["forked gloss"] },
    );
    const forked = (await forkRes.json()) as {
      domId: string;
      isOwned?: boolean;
      isCommunity?: boolean;
      isCustomized?: boolean;
      sourceCardId?: string;
    };
    checks.push({
      name: "PATCH community card (fork)",
      ok:
        forkRes.ok &&
        forked.isOwned === true &&
        forked.isCommunity === true &&
        forked.isCustomized === true &&
        forked.sourceCardId === communityCard.domId,
      detail: `status ${forkRes.status}, fork=${forked.domId}`,
    });

    const hideRes = await del(
      `/api/cards/${encodeURIComponent(communityCard.domId)}`,
    );
    const hideJson = (await hideRes.json().catch(() => ({}))) as {
      hidden?: boolean;
    };
    checks.push({
      name: "DELETE community card (hide)",
      ok: hideRes.ok && hideJson.hidden === true,
      detail: `status ${hideRes.status}`,
    });

    if (forked.domId) {
      await del(`/api/cards/${encodeURIComponent(forked.domId)}`);
    }
  } else {
    checks.push({
      name: "PATCH community card (fork)",
      ok: false,
      detail: "no community card in deck",
    });
    checks.push({
      name: "DELETE community card (hide)",
      ok: false,
      detail: "no community card in deck",
    });
  }

  const lessonsRes = await get("/api/lessons");
  const lessonsJson = (await lessonsRes.json()) as { lessons: unknown[] };
  checks.push({
    name: "GET /api/lessons",
    ok: lessonsRes.ok && lessonsJson.lessons.length > 0,
    detail: `${lessonsJson.lessons.length} lessons`,
  });

  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? "PASS" : "FAIL";
    console.log(`${mark}  ${c.name} — ${c.detail}`);
    if (!c.ok) failed++;
  }

  if (failed > 0) process.exit(1);
  console.log(`\nAll ${checks.length} checks passed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
