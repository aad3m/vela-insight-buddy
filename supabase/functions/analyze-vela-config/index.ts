
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { config, analysisType } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'analyze') {
      systemPrompt = `You are an expert DevOps engineer specializing in Vela CI/CD pipeline optimization. Analyze the provided .vela.yml configuration and provide detailed recommendations for:
1. Performance improvements
2. Cost optimization opportunities  
3. Reliability enhancements
4. Security best practices
5. Estimated time and cost savings

Format your response with clear sections using markdown headers and bullet points.`;

      userPrompt = `Please analyze this .vela.yml configuration and provide optimization recommendations:

\`\`\`yaml
${config}
\`\`\``;
    } else if (analysisType === 'optimize') {
      systemPrompt = `You are an expert DevOps engineer. Take the provided .vela.yml configuration and return an optimized version that includes:
1. Dependency caching for faster builds
2. Parallel execution where possible
3. Docker BuildKit support
4. Retry logic for flaky steps
5. Resource optimization
6. Security improvements

Return ONLY the optimized YAML configuration without explanations.`;

      userPrompt = `Optimize this .vela.yml configuration:

\`\`\`yaml
${config}
\`\`\``;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-vela-config function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
