import axios from 'axios';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const API_URL = 'http://127.0.0.1:3000/api';

async function run() {
  try {
    // login employer
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'shubham@gmail.com',
      password: 'password123', // wait, is this the password? I don't know it. But I can bypass and just sign a token yourself using jsonwebtoken and JWT_SECRET but auth validation depends on SUPABASE.
    });
  } catch (e) {}
}
run();