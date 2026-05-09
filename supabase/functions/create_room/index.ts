import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateRoomRequest {
  emotion?: string;
  topic?: string;
}

const roomTopics: Record<string, string> = {
  alegria: "Celebrando momentos felizes",
  tristeza: "Processando sentimentos",
  raiva: "Canalizando energia",
  medo: "Enfrentando medos juntos",
  surpresa: "Descobertas inesperadas",
  calma: "Meditação coletiva",
  confusão: "Buscando clareza",
  esperança: "Sonhando juntos",
  dúvida: "Questionando o impossível",
  gratidão: "Compartilhando bênçãos",
};

const roomDescriptions: Record<string, string> = {
  alegria:
    "Uma sala para compartilhar alegrias e celebrar momentos incríveis com outros pensadores",
  tristeza:
    "Espaço seguro para processar emoções profundas e encontrar apoio",
  raiva:
    "Canalize sua energia e transforme intensidade em conversas produtivas",
  medo:
    "Juntos somos mais fortes - compartilhe seus medos e descubra que não está sozinho",
  surpresa:
    "Aqui cabem todas as descobertas e momentos inesperados da vida",
  calma:
    "Encontre paz interior através de reflexões compartilhadas",
  confusão:
    "Tantas perguntas, tantas mentes - vamos buscar respostas juntas",
  esperança:
    "Sonhos coletivos criam realidade - compartilhe seu otimismo",
  dúvida:
    "Questionar é pensar - explore incertezas de forma profunda",
  gratidão:
    "Amplificar a gratidão através de histórias inspiradoras",
};

async function createRoom(emotion?: string, customTopic?: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const topic = customTopic || roomTopics[emotion || "calma"] || "Sala de Conversa";
  const description =
    roomDescriptions[emotion || "calma"] || "Uma sala para conexões profundas";

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const response = await fetch(`${supabaseUrl}/rest/v1/conversation_rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      topic,
      description,
      theme: emotion || "default",
      is_active: true,
      expires_at: expiresAt.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create room: ${response.statusText}`);
  }

  const room = await response.json();
  return room;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { emotion, topic } = body as CreateRoomRequest;

    const room = await createRoom(emotion, topic);

    return new Response(JSON.stringify(room), {
      status: 201,
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
