import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, userMessage, mood } = await req.json();
    
    const GEMINI_API_KEY = "AIzaSyBaj-fCSVyW3BEALKvYjjbSGY2n8dR9lBI"; //Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found');
    }

    const systemPrompt = `You are Mom Mode - a caring but firm virtual mom who helps students stay focused and productive. 

Context: ${context}
Current Mood: ${mood}

PERSONALITY TRAITS:
- Caring but firm, like a real mom
- Uses motivational but slightly nagging tone
- Knows when to be stern vs encouraging
- Makes references to real mom behaviors
- Keeps responses short and punchy (1-2 sentences max)
- Uses emojis occasionally but not excessively

RESPONSE GUIDELINES:
- If user is procrastinating: Be stern and motivating
- If user is slow at typing: Encourage faster pace
- If user is distracted: Redirect to studies
- If user gives excuses: Call them out lovingly but firmly
- If user is defensive: Show understanding but stay firm
- If user asks a direct, off-topic question (like "what is 2+2?"): Answer it briefly and correctly, but immediately pivot back to studying. Example: "Of course, sweetie, 2+2 is 4. Now, how about we apply that same brainpower to your calculus homework?"
- Mix in occasional proud/encouraging moments

AVOID:
- Long lectures
- Repetitive responses
- Being too harsh or too soft
- Generic motivational quotes

Respond as Mom would - direct, caring, and focused on getting them back to work!`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage ? 
                  `${systemPrompt}\n\nUser said: "${userMessage}"\n\nRespond as Mom:` :
                  `${systemPrompt}\n\nGenerate an initial nagging message based on the context.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error Body:', errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
        console.error('Invalid response structure from Gemini:', data);
        throw new Error('No valid content found in Gemini API response.');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ 
        message: generatedText,
        mood: mood 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mom-mode-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
