
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to fetch relevant Vela documentation
async function fetchVelaDocumentation(query: string) {
  try {
    // Search for relevant documentation pages based on the error/query
    const docUrls = [
      'https://go-vela.github.io/docs/concepts/pipeline/steps/',
      'https://go-vela.github.io/docs/concepts/pipeline/services/',
      'https://go-vela.github.io/docs/concepts/pipeline/secrets/',
      'https://go-vela.github.io/docs/concepts/pipeline/templates/',
      'https://go-vela.github.io/docs/usage/examples/',
      'https://go-vela.github.io/docs/reference/yaml/',
      'https://go-vela.github.io/docs/troubleshooting/'
    ];

    const relevantDocs = [];
    
    for (const url of docUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const content = await response.text();
          // Extract meaningful content from HTML
          const textContent = content
            .replace(/<script[^>]*>.*?<\/script>/gs, '')
            .replace(/<style[^>]*>.*?<\/style>/gs, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Check if content is relevant to the query
          if (textContent.toLowerCase().includes(query.toLowerCase()) || 
              query.toLowerCase().split(' ').some(word => textContent.toLowerCase().includes(word))) {
            relevantDocs.push({
              url,
              content: textContent.slice(0, 2000) // Limit content length
            });
          }
        }
      } catch (error) {
        console.log(`Failed to fetch ${url}:`, error);
      }
    }
    
    return relevantDocs;
  } catch (error) {
    console.error('Error fetching Vela docs:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logs, error, repo, step, branch, pipeline_config } = await req.json();

    console.log('Enhanced analysis request:', { repo, step, branch });

    // Fetch relevant Vela documentation
    const velaQuery = `${error} ${step} ${logs}`.slice(0, 100);
    const velaDocs = await fetchVelaDocumentation(velaQuery);
    
    const systemPrompt = `You are an expert DevOps engineer and Vela CI/CD specialist. You have access to the official Vela documentation and years of experience troubleshooting pipeline failures.

Your expertise includes:
- Deep understanding of Vela YAML syntax and configuration
- Common pipeline failure patterns and their solutions
- Docker container issues and debugging
- Build optimization techniques
- Security and secrets management in pipelines
- Integration with various tools and services

Analyze the provided build failure and:
1. Identify the root cause with technical depth
2. Provide specific, actionable workarounds
3. Reference Vela documentation when applicable
4. Suggest preventive measures and best practices
5. Include code snippets for fixes when possible

Be thorough but practical. Focus on solutions that can be implemented immediately.`;

    const velaDocsContext = velaDocs.length > 0 
      ? `\n\nRelevant Vela Documentation:\n${velaDocs.map(doc => `${doc.url}:\n${doc.content}`).join('\n\n')}`
      : '';

    const userPrompt = `Analyze this Vela pipeline failure:

Repository: ${repo}
Branch: ${branch}
Failed Step: ${step}
Error Message: ${error}

Build Logs:
\`\`\`
${logs}
\`\`\`

${pipeline_config ? `Pipeline Configuration:
\`\`\`yaml
${pipeline_config}
\`\`\`` : ''}

${velaDocsContext}

Please provide:
1. **Root Cause Analysis**: What exactly went wrong and why?
2. **Immediate Workarounds**: Quick fixes to get the pipeline working
3. **Proper Solutions**: Long-term fixes that address the underlying issue
4. **Code Examples**: Show specific YAML changes or commands needed
5. **Prevention**: How to avoid this issue in the future
6. **Vela Best Practices**: Relevant recommendations from the documentation

Format your response with clear sections and actionable steps.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Extract different sections from the analysis
    const sections = {
      rootCause: extractSection(analysis, 'Root Cause Analysis'),
      workarounds: extractSection(analysis, 'Immediate Workarounds'),
      solutions: extractSection(analysis, 'Proper Solutions'),
      codeExamples: extractSection(analysis, 'Code Examples'),
      prevention: extractSection(analysis, 'Prevention'),
      bestPractices: extractSection(analysis, 'Vela Best Practices')
    };

    return new Response(JSON.stringify({ 
      analysis, 
      sections,
      velaDocs: velaDocs.map(doc => doc.url),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhanced-failure-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`\\*\\*${sectionName}[:\\*]*\\*\\*:?([\\s\\S]*?)(?=\\*\\*[^\\*]+[:\\*]*\\*\\*|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}
