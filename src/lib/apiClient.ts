// API client for LLM buy-box parsing
export async function parseBuyBoxLLM(text: string): Promise<any> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  if (!apiBaseUrl) {
    throw new Error('No API base URL configured');
  }
  
  const response = await fetch(`${apiBaseUrl}/parseBuyBox`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return await response.json();
}