import OpenAI from 'openai';

// Initialize the OpenAI client with the environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for client-side usage
});

// Export the OpenAI instance
export const getOpenAIInstance = () => {
  if (!openai) {
    throw new Error('OpenAI API key is not set in environment variables');
  }
  return openai;
};

export const generateReactNativeCode = async (prompt: string): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Next.js and React expert specializing in creating complete project structures. Generate a full Next.js project based on the user's prompt.

Your response MUST follow these rules:
1. Create multiple interconnected files that form a complete, working project
2. Use TypeScript and the App Router (not Pages Router)
3. Use Tailwind CSS for styling
4. Include all necessary files (components, pages, utilities, types, etc.)
5. Format your response with clear file markers using the format: // FILE: path/to/filename.ext
6. Include proper imports between files to ensure they work together
7. Add realistic data and functionality
8. Include a package.json with necessary dependencies
9. Add appropriate comments explaining the code

File structure should include:
- Main page components in app/ directory
- Reusable components in components/ directory
- Utility functions in utils/ directory
- Type definitions in types/ directory
- API routes in app/api/ directory (if needed)
- CSS/styling in appropriate files

Each file should be complete and properly formatted with the file marker.`
        },
        {
          role: "user",
          content: `Create a complete Next.js project for: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message.content || 'Error: No response from OpenAI';
  } catch (error) {
    console.error('Error generating code with OpenAI:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const modifyReactNativeCode = async (existingCode: string, modificationPrompt: string): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Next.js and React expert specializing in modifying project structures. Modify the provided Next.js project code according to the user's request.

Your response MUST follow these rules:
1. Preserve the existing file structure with // FILE: markers
2. Modify the files as requested by the user
3. You can add new files if needed using the // FILE: marker format
4. Make sure all imports and connections between files remain working
5. Use TypeScript and Tailwind CSS for styling
6. Return the complete modified project with all files

Each file should be complete and properly formatted with the file marker.`
        },
        {
          role: "user",
          content: `Here is the existing Next.js project code:\n\n${existingCode}\n\nModify this project to: ${modificationPrompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message.content || 'Error: No response from OpenAI';
  } catch (error) {
    console.error('Error modifying code with OpenAI:', error);
    throw new Error(`Failed to modify code: ${error instanceof Error ? error.message : String(error)}`);
  }
};
