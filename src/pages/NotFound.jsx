// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container" style={{ 
      textAlign: 'center',
      padding: '80px 20px',
      maxWidth: '800px',
      margin: '0 auto',
      color: 'white',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: '#000',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 204, 0, 0.1), transparent 70%)'
    }}>
      <h1 style={{ 
        fontSize: '4rem', 
        marginBottom: '0.5rem',
        fontWeight: '700'
      }}>
        404
      </h1>
      <h2 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '1.5rem',
        fontWeight: '600'
      }}>
        <span style={{ color: '#FFD700' }}>Workout</span> Not Found
      </h2>
      
      <p style={{ 
        fontSize: '1.2rem', 
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto 2rem'
      }}>
        Looks like you have wandered off your fitness path! This page does not exist, but your journey does not have to end here.
      </p>
      
      <div style={{ margin: '2rem 0' }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
          <path d="M18 4L21 7M21 7L18 10M21 7H16M6 20L3 17M3 17L6 14M3 17H8" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#FFD700" strokeWidth="2"/>
          <path d="M12 5V9M12 15V19" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      <Link to="/" style={{
        display: 'inline-block',
        marginTop: '1rem',
        padding: '12px 30px',
        backgroundColor: '#FFD700',
        color: 'black',
        textDecoration: 'none',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        border: '2px solid #FFD700'
      }} 
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#FFD700';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#FFD700';
        e.currentTarget.style.color = 'black';
      }}>
        GET BACK ON TRACK
      </Link>
      
      <p style={{ 
        fontSize: '1rem', 
        marginTop: '2rem',
        opacity: '0.7'
      }}>
        Remember, every fitness journey has detours. Lets get you back on the right path.
      </p>
    </div>
  );
};

export default NotFound;