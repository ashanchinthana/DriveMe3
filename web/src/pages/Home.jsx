import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background-color: ${props => props.primary ? '#007bff' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#007bff'};
  border: 2px solid ${props => props.primary ? '#007bff' : '#007bff'};
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#0069d9' : 'rgba(0, 123, 255, 0.1)'};
  }
`;

const FeaturesSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #333;
    margin-top: 0;
  }
  
  p {
    color: #555;
    line-height: 1.6;
  }
`;

const AdminSection = styled.section`
  background-color: #343a40;
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  text-align: center;
  
  h2 {
    color: white;
    margin-top: 0;
  }
  
  p {
    color: #ced4da;
    margin-bottom: 1.5rem;
  }
`;

const AdminButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const AdminButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      
      
      <FeaturesSection>
        <FeatureCard>
          <h2>Manage Your License</h2>
          <p>Check license status, expiry dates, and request renewals all from one place. Get notified before your license expires.</p>
        </FeatureCard>
        
        <FeatureCard>
          <h2>Track Your Fines</h2>
          <p>View and manage traffic fines, get notified of new fines, and make payments online quickly and securely.</p>
        </FeatureCard>
        
        <FeatureCard>
          <h2>Secure Payments</h2>
          <p>Pay fines and license renewal fees through our secure payment system with multiple payment options.</p>
        </FeatureCard>
      </FeaturesSection>
      
      <AdminSection>
        <h2>Administration</h2>
        <p>Access the admin portal to manage police accounts and system settings.</p>
        <AdminButtonContainer>
          <AdminButton to="/admin/login">Admin Login</AdminButton>
         <AdminButton to="/admin/register">Admin Register</AdminButton>
        </AdminButtonContainer>
      </AdminSection>
    </HomeContainer>
  );
};

export default Home; 