'use server'

const API_BASE_URL = 'http://localhost:2040';

// eslint-disable-next-line
export async function fetchData({ 
  method = "GET", 
  url, 
  token, 
  body, 
  headers 
}: { 
  method?: string; 
  url: string; 
  token?: string; 
  body?: any; 
  headers?: any;
}) {
  try {
    // Determine if we're sending FormData (for file uploads)
    const isFormData = body instanceof FormData;
    
    // Prepare headers
    const defaultHeaders: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
    };
    
    // Only add Content-Type for JSON, not for FormData
    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }
    
    // Merge with custom headers
    const finalHeaders = headers ? { ...defaultHeaders, ...headers } : defaultHeaders;
    
    // Prepare body - don't stringify FormData
    const finalBody = body ? (isFormData ? body : JSON.stringify(body)) : null;
    
    const response = await fetch(API_BASE_URL + url, {
      method,
      headers: finalHeaders,
      body: finalBody
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Re-throw to handle in components
  }
}

export async function Login({ payload }: { payload: { email: string; password: string } }) {
  try {
    const response = await fetch(API_BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password
        })
      });

    const res = await response.json();

    return res;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export async function SignIn({ payload }: { payload: { email: string; password: string, name: string } }) {
  try {
    const response = await fetch(API_BASE_URL + '/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password
        })
      })

    const res = await response.json();
    
    return res;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}