import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getCurrentUser, logout } from '../services/authService';

const DashboardContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #c82333;
  }
`;

const WelcomeMessage = styled.div`
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  
  h2 {
    margin-top: 0;
    color: #333;
  }
  
  p {
    font-size: 1.1rem;
    line-height: 1.5;
    color: #555;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) return null;
  
  return (
    <DashboardContainer>
      <Header>
        <Title>DriveMe Dashboard</Title>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      
      <WelcomeMessage>
        <h2>Welcome to DriveMe!</h2>
        <p>
          This is your personal dashboard where you can manage your driver's license, 
          view traffic fines, make payments, and access other driving-related services.
        </p>
      </WelcomeMessage>
      
      {/* Placeholder for future dashboard content */}
      <div>
        <h3>Your Information</h3>
        <p>Name: {user.name || 'Not available'}</p>
        <p>ID Number: {user.idNumber || 'Not available'}</p>
        <p>License: {user.dlNumber || 'Not available'}</p>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard; 