import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MatchRequest {
  userId: string;
}

interface Match {
  userId: string;
  compatibility: number;
  reason: string;
}

async function findMatches(userId: string): Promise<Match[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Get user's thoughts
  const userThoughtsRes = await fetch(
    `${supabaseUrl}/rest/v1/thoughts?user_id=eq.${userId}&select=*`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    }
  );

  const userThoughts = await userThoughtsRes.json();
  if (!userThoughts || userThoughts.length === 0) {
    return [];
  }

  // Get emotions from user's thoughts
  const userEmotions = userThoughts
    .filter((t: { emotion: string | null }) => t.emotion)
    .map((t: { emotion: string }) => t.emotion);

  if (userEmotions.length === 0) {
    return [];
  }

  // Find other users with similar emotions
  const otherUsersRes = await fetch(
    `${supabaseUrl}/rest/v1/thoughts?select=user_id,emotion`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    }
  );

  const allThoughts = await otherUsersRes.json();

  // Calculate compatibility scores
  const userScores: Record<string, number> = {};
  const reasons: Record<string, string[]> = {};

  allThoughts.forEach(
    (thought: { user_id: string; emotion: string | null }) => {
      if (thought.user_id === userId || !thought.emotion) return;

      if (!userScores[thought.user_id]) {
        userScores[thought.user_id] = 0;
        reasons[thought.user_id] = [];
      }

      if (userEmotions.includes(thought.emotion)) {
        userScores[thought.user_id] += 1;
        reasons[thought.user_id].push(thought.emotion);
      }
    }
  );

  // Convert to matches array
  const matches: Match[] = Object.entries(userScores)
    .map(([otherId, score]) => ({
      userId: otherId,
      compatibility: Math.min(score / userEmotions.length, 1),
      reason:
        reasons[otherId].length > 0
          ? `Compartilha sentimentos de ${reasons[otherId]
              .slice(0, 2)
              .join(" e ")}`
          : "Pensamento similar",
    }))
    .filter((m) => m.compatibility > 0.3)
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 10);

  // Store in database
  for (const match of matches) {
    // Check if connection already exists
    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/user_connections?or=(and(user_a_id.eq.${userId},user_b_id.eq.${match.userId}),and(user_a_id.eq.${match.userId},user_b_id.eq.${userId}))`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const existing = await existingRes.json();

    if (!existing || existing.length === 0) {
      await fetch(`${supabaseUrl}/rest/v1/user_connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          user_a_id: userId,
          user_b_id: match.userId,
          compatibility_score: match.compatibility,
          reason: match.reason,
        }),
      }).catch(() => {
        // Ignore duplicate key errors
      });
    }
  }

  return matches;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userId }: MatchRequest = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const matches = await findMatches(userId);

    return new Response(JSON.stringify({ matches }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
