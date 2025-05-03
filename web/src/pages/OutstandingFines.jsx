import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getCurrentUser } from '../services/authService';
import { getOutstandingFines, getFinesByLicense, disputeFine } from '../services/fineService';

const PageContainer = styled.div`
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

const BackButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #0069d9;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &:after {
    content: " ";
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 6px solid #007bff;
    border-color: #007bff transparent #007bff transparent;
    animation: spin 1.2s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const FineCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FineTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const FineStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
  background-color: ${props => {
    switch(props.status) {
      case 'Paid': return '#d4edda';
      case 'Disputed': return '#fff3cd';
      case 'Overdue': return '#f8d7da';
      default: return '#e2e3e5'; // Pending
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'Paid': return '#155724';
      case 'Disputed': return '#856404';
      case 'Overdue': return '#721c24';
      default: return '#383d41'; // Pending
    }
  }};
`;

const FineDetail = styled.div`
  margin-bottom: 0.5rem;
  
  strong {
    display: inline-block;
    width: 120px;
    color: #555;
  }
`;

const FineAmount = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 1rem 0;
  color: #dc3545;
`;

const ActionButton = styled.button`
  background-color: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#0069d9' : '#5a6268'};
  }
  
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const NoFinesMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  h3 {
    color: #28a745;
    margin-bottom: 1rem;
  }
  
  p {
    color: #6c757d;
    font-size: 1.1rem;
  }
`;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

const OutstandingFines = () => {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeLoading, setDisputeLoading] = useState(false);
  
  const user = getCurrentUser();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    const loadFines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get fines from the authenticated endpoint
        try {
          const response = await getOutstandingFines();
          setFines(response.data || []);
        } catch (err) {
          console.warn('Could not get fines from authenticated endpoint, falling back to public endpoint');
          
          // Fall back to the public endpoint using license number
          if (user.dlNumber) {
            const response = await getFinesByLicense(user.dlNumber);
            
            // Filter for outstanding (pending/overdue) fines
            const outstandingFines = response.data.filter(
              fine => fine.status === 'Pending' || fine.status === 'Overdue'
            );
            
            setFines(outstandingFines || []);
          } else {
            throw new Error('License number not available');
          }
        }
      } catch (err) {
        console.error('Error loading fines:', err);
        setError(err.message || 'Failed to load outstanding fines');
      } finally {
        setLoading(false);
      }
    };
    
    loadFines();
  }, [user, navigate]);
  
  const handleDisputeFine = async (fineId) => {
    if (!window.confirm('Are you sure you want to dispute this fine?')) {
      return;
    }
    
    try {
      setDisputeLoading(true);
      await disputeFine(fineId);
      
      // Update the fine status in the UI
      setFines(fines.map(fine => 
        fine._id === fineId ? { ...fine, status: 'Disputed' } : fine
      ));
      
      alert('Fine has been marked as disputed');
    } catch (err) {
      console.error('Error disputing fine:', err);
      alert(err.message || 'Failed to dispute fine');
    } finally {
      setDisputeLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Title>Outstanding Fines</Title>
          <BackButton onClick={handleGoBack}>Back to Dashboard</BackButton>
        </Header>
        <LoadingSpinner />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Header>
        <Title>Outstanding Fines</Title>
        <BackButton onClick={handleGoBack}>Back to Dashboard</BackButton>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!loading && !error && fines.length === 0 && (
        <NoFinesMessage>
          <h3>No Outstanding Fines</h3>
          <p>You do not have any outstanding fines at this time.</p>
        </NoFinesMessage>
      )}
      
      {fines.map(fine => (
        <FineCard key={fine._id}>
          <FineHeader>
            <FineTitle>Fine #{fine.fineId}</FineTitle>
            <FineStatus status={fine.status}>{fine.status}</FineStatus>
          </FineHeader>
          
          <FineDetail>
            <strong>Date Issued:</strong> {formatDate(fine.date)}
          </FineDetail>
          
          <FineDetail>
            <strong>Description:</strong> {fine.description}
          </FineDetail>
          
          <FineDetail>
            <strong>Location:</strong> {fine.location}
          </FineDetail>
          
          <FineAmount>
            Amount Due: {formatCurrency(fine.amount)}
          </FineAmount>
          
          <div>
            <ActionButton 
              variant="primary"
              onClick={() => navigate(`/payment/${fine._id}`)}
              disabled={fine.status === 'Disputed'}
            >
              Pay Now
            </ActionButton>
            
            <ActionButton 
              onClick={() => handleDisputeFine(fine._id)}
              disabled={fine.status === 'Disputed' || disputeLoading}
            >
              {disputeLoading ? 'Processing...' : 'Dispute Fine'}
            </ActionButton>
          </div>
        </FineCard>
      ))}
    </PageContainer>
  );
};

export default OutstandingFines; 