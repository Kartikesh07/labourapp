async function fetchHome() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email: 'newwork@cc.com', password: 'Password123!' }), headers: { 'Content-Type': 'application/json' }
    });
    const d = await res.json();
    const token = d.data.session.access_token;
    
    const jobsRes = await fetch('http://127.0.0.1:3000/api/jobs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(await jobsRes.json());
  } catch (error: any) {
    console.error(error);
  }
}
fetchHome();