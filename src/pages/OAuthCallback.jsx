import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function OAuthCallback(){
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(()=>{
    // Parse query params from the URL
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session') || params.get('token') || null;
    const merchantName = params.get('merchantName') || params.get('name') || null;
    const merchantEmail = params.get('merchantEmail') || params.get('email') || null;

    if(!session){
      setMessage('Missing session token in callback URL.');
      // optionally allow redirect to login after 3s
      setTimeout(()=>navigate('/login'), 3000);
      return;
    }

    // Persist session and optional user info locally
    try{
      localStorage.setItem('pk_session', session);
      if(merchantName) localStorage.setItem('pk_merchantName', merchantName);
      if(merchantEmail) localStorage.setItem('pk_merchantEmail', merchantEmail);
      setMessage('Authentication successful — redirecting...');

      // Give the user a brief moment then navigate to dashboard
      setTimeout(()=>{
        navigate('/dashboard');
      }, 700);
    }catch(e){
      setMessage('Failed to save session locally.');
      setTimeout(()=>navigate('/login'), 2000);
    }
  },[navigate]);

  return (
    <main className="page-root">
      <div className="container card" style={{textAlign:'center'}}>
        <h3>{message}</h3>
      </div>
    </main>
  );
}
