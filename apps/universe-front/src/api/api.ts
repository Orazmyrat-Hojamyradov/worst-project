'use server'

const API_BASE_URL = 'http://localhost:2040';

// eslint-disable-next-line
export async function fetchData({ method ="GET", url, token, body, headers }: { method?: string, url: string, token?: string, body?: any, headers?: any }) {
  try {
    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMjIyMTNlNy1kMzFhLTRkMTEtYjdiYi03NDNhNTk3MmMzMTMiLCJlbWFpbCI6ImFsaWVAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODUyMTE4MywiZXhwIjoxNzU4NTIyMDgzfQ.kNaL7OP5WdeD2sFFLm-8VdM38aI2iUoZelhrmUMhtss'
    const response = await fetch(API_BASE_URL + url, {
      method,
      headers: !headers ?  {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      } : { ...headers, "Authorization": `Bearer ${token}` },
      body: body ? JSON.stringify(body) : null
    });

    const data = await response.json();
    console.log(data);
    
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
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
    const response = await fetch(API_BASE_URL + '/auth/register', {
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