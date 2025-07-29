import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    // Prepare messages for Deepseek API
    const messages = [
      {
        role: 'system',
        content: 'Du bist ein hilfreicher AI-Assistent für einen Travel Blog. Antworte freundlich und hilfsbereit auf Deutsch. Du kannst Fragen über Reisen, Destinations und die Blog-Inhalte beantworten.'
      },
      ...(conversation || []),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to Deepseek API...');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepseek API error:', errorText);
      throw new Error(`Deepseek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Deepseek API response received');

    const assistantMessage = data.choices[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error('No response from Deepseek API');
    }

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-deepseek function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});