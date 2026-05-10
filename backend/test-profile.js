
async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com', 
      password: 'password123' 
    })
  });
  
  const loginData = await loginRes.json();
  if (!loginData.token) {
    console.error('Login failed', loginData);
    return;
  }
  
  const token = loginData.token;
  
  // Now update profile
  const putRes = await fetch('http://localhost:3000/api/users/profile', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Test Name',
      email: 'tanish1@gmail.com',
      avatar_url: 'https://example.com/photo.jpg',
      preferred_currency: 'USD'
    })
  });
  
  const putData = await putRes.json();
  console.log('PUT result:', putData);
  
  // Now GET profile
  const getRes = await fetch('http://localhost:3000/api/users/profile', {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  const getData = await getRes.json();
  console.log('GET result:', getData);
}

test();
