
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

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

async function analyzeWithGroq(prompt: string) {
  if (!groqApiKey) throw new Error('Groq API key not found');
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are an expert DevOps engineer and Vela CI/CD specialist. Analyze the provided build failure and provide detailed insights with actionable solutions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Fallback basic analysis without AI
function basicAnalysis(logs: string, error: string, step: string) {
  const analysis = `**Root Cause Analysis**: The pipeline failed at step "${step}" with error: ${error}

**Immediate Workarounds**:
- Check if the step configuration is correct
- Verify that all required dependencies are available
- Review the step's Docker image and commands

**Proper Solutions**:
- Examine the build logs for specific error patterns
- Update pipeline configuration if needed
- Check for resource constraints or permissions issues

**Code Examples**:
\`\`\`yaml
steps:
  - name: ${step}
    image: # verify this image exists and is accessible
    commands:
      # check these commands are correct
\`\`\`

**Prevention**:
- Add validation steps before the failing step
- Use proper error handling in pipeline configuration
- Test pipeline changes in a development environment

**Vela Best Practices**:
- Use specific image tags instead of 'latest'
- Implement proper secret management
- Add adequate logging for debugging
`;

  return {
    analysis,
    sections: {
      rootCause: `The pipeline failed at step "${step}" with error: ${error}`,
      workarounds: "Check step configuration, verify dependencies, review Docker image",
      solutions: "Examine logs, update configuration, check resources/permissions", 
      codeExamples: `steps:\n  - name: ${step}\n    image: # verify image\n    commands: # check commands`,
      prevention: "Add validation, use error handling, test in dev environment",
      bestPractices: "Use specific tags, manage secrets properly, add logging"
    }
  };
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

    let analysis;
    let aiProvider = 'Basic Analysis';

    // Try Groq first, fallback to basic analysis
    try {
      if (groqApiKey) {
        console.log('Analyzing with Groq Llama3-8B...');
        analysis = await analyzeWithGroq(userPrompt);
        aiProvider = 'Groq Llama3-8B';
      } else {
        console.log('No Groq API key found, using basic analysis...');
        const basicResult = basicAnalysis(logs, error, step);
        analysis = basicResult.analysis;
      }
    } catch (groqError) {
      console.error('Groq analysis failed, falling back to basic analysis:', groqError);
      const basicResult = basicAnalysis(logs, error, step);
      analysis = basicResult.analysis;
      aiProvider = 'Basic Analysis (Groq failed)';
    }

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
      aiProvider,
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
