import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  thoughtId: string;
  content: string;
}

interface AnalysisResponse {
  emotion: string;
  confidence: number;
  tags: string[];
}

async function analyzeThought(content: string): Promise<AnalysisResponse> {
  const emotions = [
    "alegria",
    "tristeza",
    "raiva",
    "medo",
    "surpresa",
    "calma",
    "confusão",
    "esperança",
    "dúvida",
    "gratidão",
  ];

  // Análise simplificada baseada em palavras-chave
  const contentLower = content.toLowerCase();

  const emotionScores: Record<string, number> = {};
  emotions.forEach((emotion) => {
    emotionScores[emotion] = 0;
  });

  // Keywords para cada emoção
  const keywords: Record<string, string[]> = {
    alegria: ["feliz", "alegre", "amo", "amei", "legal", "incrível", "melhor"],
    tristeza: ["triste", "ruim", "choro", "infeliz", "pior", "péssimo"],
    raiva: ["raiva", "odeio", "irritado", "furioso", "bravo"],
    medo: ["medo", "assustado", "nervoso", "ansiedade", "preocupado"],
    surpresa: ["surpreso", "wow", "não esperava", "inesperado"],
    calma: ["calma", "paz", "relaxado", "tranquilo", "sereno"],
    confusão: ["confuso", "perdido", "não entendo", "complicado"],
    esperança: ["esperança", "otimista", "acredito", "vai dar"],
    dúvida: ["acho que", "talvez", "incerto", "não sei", "dúvida"],
    gratidão: ["obrigado", "grato", "agradecido", "valeu"],
  };

  // Score emotions based on keywords
  Object.entries(keywords).forEach(([emotion, words]) => {
    words.forEach((word) => {
      if (contentLower.includes(word)) {
        emotionScores[emotion] += 1;
      }
    });
  });

  // Find dominant emotion
  const maxScore = Math.max(...Object.values(emotionScores));
  const dominantEmotion =
    Object.entries(emotionScores).find(([, score]) => score === maxScore)?.[0] ||
    "neutra";

  const confidence = Math.min(maxScore / 3, 1);

  return {
    emotion: dominantEmotion,
    confidence,
    tags: Object.entries(emotionScores)
      .filter(([, score]) => score > 0)
      .map(([emotion]) => emotion),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { thoughtId, content }: AnalysisRequest = await req.json();

    if (!thoughtId || !content) {
      return new Response(
        JSON.stringify({ error: "Missing thoughtId or content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const analysis = await analyzeThought(content);

    // Update thought with emotion
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      await fetch(`${supabaseUrl}/rest/v1/thoughts?id=eq.${thoughtId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ emotion: analysis.emotion }),
      });

      // Insert emotional tags
      for (const tag of analysis.tags) {
        await fetch(`${supabaseUrl}/rest/v1/emotional_tags`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            thought_id: thoughtId,
            emotion: tag,
            confidence: analysis.confidence,
          }),
        });
      }
    }

    return new Response(JSON.stringify(analysis), {
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
