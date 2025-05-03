import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  getCurrentAdmin, 
  logoutAdmin, 
  getPoliceAccounts, 
  deletePoliceAccount,
  searchPoliceAccounts
} from '../../services/adminService';
import PoliceAccountForm from '../../components/admin/PoliceAccountForm';

const DashboardContainer = styled.div`
  max-width: 1200px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  background-color: ${props => props.primary ? '#343a40' : '#6c757d'};
  color: white;
  border: none;
  
  &:hover {
    background-color: ${props => props.primary ? '#23272b' : '#5a6268'};
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const Card = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  h3 {
    margin-top: 0;
    color: #343a40;
  }
  
  p {
    color: #6c757d;
    margin-bottom: 1rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.danger ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: ${props => props.danger ? '#c82333' : '#5a6268'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  
  &:hover {
    color: #343a40;
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

// Memoized form wrapper to prevent unnecessary re-renders
const MemoizedPoliceAccountForm = memo(PoliceAccountForm);

// Additional styled components for search bar
const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
`;

const SearchBar = ({ value, onChange }) => (
  <SearchContainer>
    <SearchInput
      type="text"
      placeholder="Search by ID or name..."
      value={value}
      onChange={onChange}
    />
  </SearchContainer>
);

// Simple debounce implementation
const debounce = (fn, delay) => {
  let timeoutId;
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const AdminDashboard = () => {
  const [policeAccounts, setPoliceAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const admin = getCurrentAdmin();
  
  // Load data only once when component mounts
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    // Only fetch data if not already initialized
    if (!initialized) {
      console.log('Loading police accounts initially');
      fetchAccountsData();
      setInitialized(true);
    }
  }, [admin, navigate, initialized]);
  
  // Filter accounts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is empty, show all accounts
      setFilteredAccounts(policeAccounts);
    } else {
      // For short queries, filter client-side
      if (searchQuery.length < 3) {
        const query = searchQuery.toLowerCase().trim();
        const filtered = policeAccounts.filter(account => 
          account.id.toLowerCase().includes(query) || 
          account.name.toLowerCase().includes(query)
        );
        setFilteredAccounts(filtered);
      } else {
        // For longer queries, use server-side search
        handleServerSearch();
      }
    }
  }, [searchQuery, policeAccounts]);
  
  // Debounced server-side search
  const handleServerSearch = useCallback(
    debounce(async () => {
      if (searchQuery.trim().length < 3) return;
      
      try {
        setLoading(true);
        const response = await searchPoliceAccounts(searchQuery.trim());
        
        if (response && response.success) {
          setFilteredAccounts(response.data);
        }
      } catch (err) {
        console.error('Server search error:', err);
        // Fallback to client-side search if server search fails
        const query = searchQuery.toLowerCase().trim();
        const filtered = policeAccounts.filter(account => 
          account.id.toLowerCase().includes(query) || 
          account.name.toLowerCase().includes(query)
        );
        setFilteredAccounts(filtered);
      } finally {
        setLoading(false);
      }
    }, 500),
    [searchQuery, policeAccounts]
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If the search query is cleared, reset to show all accounts
    if (!value.trim()) {
      setFilteredAccounts(policeAccounts);
    }
  };
  
  // Separate function to fetch accounts data
  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching police accounts data...');
      
      const response = await getPoliceAccounts();
      
      if (response && response.success && Array.isArray(response.data)) {
        console.log(`Successfully loaded ${response.data.length} police accounts`);
        setPoliceAccounts(response.data);
        setFilteredAccounts(response.data);
      } else {
        console.error('Invalid response format:', response);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Failed to load police accounts:', err);
      setError(err.message || 'Failed to load police accounts');
    } finally {
      setLoading(false);
    }
  };
  
  // Manually reload data when needed
  const reloadData = useCallback(() => {
    console.log('Manually reloading police accounts data');
    fetchAccountsData();
  }, []);
  
  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this police account?')) {
      try {
        await deletePoliceAccount(id);
        // Manually refresh the data after deletion
        reloadData();
      } catch (err) {
        setError('Failed to delete police account');
        console.error(err);
      }
    }
  };
  
  const handleCreateAccount = () => {
    setAccountToEdit(null);
    setShowModal(true);
  };
  
  const handleEditAccount = (account) => {
    setAccountToEdit(account);
    setShowModal(true);
  };
  
  const handleFormSuccess = () => {
    setShowModal(false);
    // Manually refresh the data after form submission
    reloadData();
  };
  
  if (!admin) return null;
  
  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Dashboard</Title>
        <ButtonGroup>
          <Button primary onClick={handleCreateAccount}>Create Police Account</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </ButtonGroup>
      </Header>
      
      <Section>
        <SectionTitle>Admin Information</SectionTitle>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h3>Account Details</h3>
              <p><strong>ID:</strong> {admin.idNumber}</p>
              <p><strong>Name:</strong> {admin.name || 'Not available'}</p>
              <p><strong>Position:</strong> {admin.position || 'Not available'}</p>
            </div>
            <div>
              <h3>Contact Information</h3>
              <p><strong>Email:</strong> {admin.email || 'Not available'}</p>
              <p><strong>Phone:</strong> {admin.phone || 'Not available'}</p>
              <p><strong>Role:</strong> {admin.role}</p>
            </div>
          </div>
        </Card>
      </Section>
      
      <Section>
        <SectionTitle>Police Account Management</SectionTitle>
        <Card>
          <h3>Manage Police Accounts</h3>
          <p>Create, update, and delete police officer accounts.</p>
          
          {error && <p style={{ color: '#dc3545' }}>{error}</p>}
          
          <SearchBar 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          
          {searchQuery.trim() && (
            <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
              Found {filteredAccounts.length} {filteredAccounts.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          )}
          
          {loading ? (
            <p>Loading accounts...</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5">No police accounts found</td>
                  </tr>
                ) : (
                  filteredAccounts.map(account => (
                    <tr key={account._id || account.id}>
                      <td>{account.id}</td>
                      <td>{account.name}</td>
                      <td>{new Date(account.createdAt).toLocaleString()}</td>
                      <td>{account.lastLogin ? new Date(account.lastLogin).toLocaleString() : 'Never'}</td>
                      <td>
                        <ActionButton onClick={() => handleEditAccount(account)}>Edit</ActionButton>
                        <ActionButton danger onClick={() => handleDelete(account.id)}>Delete</ActionButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </Section>
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{accountToEdit ? 'Edit Police Account' : 'Create Police Account'}</h3>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <MemoizedPoliceAccountForm 
              accountToEdit={accountToEdit}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowModal(false)}
            />
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

export default AdminDashboard; 