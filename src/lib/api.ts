import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction<T>(
  functionName: string,
  payload: unknown
): Promise<T> {
  const apiUrl = `${supabaseUrl}/functions/v1/${functionName}`;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${supabaseAnonKey}`,
  };

  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Function ${functionName} failed: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeThought(thoughtId: string, content: string) {
  return callEdgeFunction('analyze_thought', {
    thoughtId,
    content,
  });
}

export async function findMatches(userId: string) {
  return callEdgeFunction('find_matches', {
    userId,
  });
}

export async function createRoom(emotion?: string, topic?: string) {
  return callEdgeFunction('create_room', {
    emotion,
    topic,
  });
}
