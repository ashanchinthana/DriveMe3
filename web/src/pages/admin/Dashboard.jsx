import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  getCurrentAdmin, 
  logoutAdmin, 
  getPoliceAccounts, 
  deletePoliceAccount,
  searchPoliceAccounts,
  getAdminAccounts,
  deleteAdminAccount,
  searchAdminAccounts
} from '../../services/adminService';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
} from '../../services/userManagementService';
import PoliceAccountForm from '../../components/admin/PoliceAccountForm';
import AdminAccountForm from '../../components/admin/AdminAccountForm';
import UserForm from '../../components/admin/UserForm';

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
      fn.apply(this, args);
    }, delay);
  };
};

const AdminDashboard = () => {
  // Police accounts state
  const [policeAccounts, setPoliceAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin accounts state
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [filteredAdminAccounts, setFilteredAdminAccounts] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);
  const [adminInitialized, setAdminInitialized] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  
  // User accounts state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userInitialized, setUserInitialized] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
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
    
    // Load admin accounts
    if (!adminInitialized) {
      console.log('Loading admin accounts initially');
      fetchAdminAccountsData();
      setAdminInitialized(true);
    }
    
    // Load user accounts
    if (!userInitialized) {
      console.log('Loading user accounts initially');
      fetchUserData();
      setUserInitialized(true);
    }
  }, [admin, navigate, initialized, adminInitialized, userInitialized]);
  
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
  
  // Filter admin accounts when search query changes
  useEffect(() => {
    if (adminAccounts.length > 0) {
      if (!adminSearchQuery.trim()) {
        // If search is empty, show all accounts
        setFilteredAdminAccounts(adminAccounts);
      } else {
        // For short queries, filter client-side
        if (adminSearchQuery.length < 3) {
          const query = adminSearchQuery.toLowerCase().trim();
          const filtered = adminAccounts.filter(account => 
            account.idNumber.toLowerCase().includes(query) || 
            account.name.toLowerCase().includes(query) ||
            (account.email && account.email.toLowerCase().includes(query))
          );
          setFilteredAdminAccounts(filtered);
        } else {
          // For longer queries, use server-side search
          handleAdminServerSearch();
        }
      }
    }
  }, [adminSearchQuery, adminAccounts]);
  
  // Debounced server-side search for admin accounts
  const handleAdminServerSearch = debounce(async () => {
    if (adminSearchQuery.trim().length < 3) return;
    
    try {
      setAdminLoading(true);
      const response = await searchAdminAccounts(adminSearchQuery.trim());
      
      if (response && response.success) {
        setFilteredAdminAccounts(response.data);
      }
    } catch (err) {
      console.error('Server search error:', err);
      // Fallback to client-side search if server search fails
      const query = adminSearchQuery.toLowerCase().trim();
      const filtered = adminAccounts.filter(account => 
        account.idNumber.toLowerCase().includes(query) || 
        account.name.toLowerCase().includes(query) ||
        (account.email && account.email.toLowerCase().includes(query))
      );
      setFilteredAdminAccounts(filtered);
    } finally {
      setAdminLoading(false);
    }
  }, 500);
  
  // Handle admin search input change
  const handleAdminSearchChange = (e) => {
    const value = e.target.value;
    setAdminSearchQuery(value);
    
    // If the search query is cleared, reset to show all accounts
    if (!value.trim()) {
      setFilteredAdminAccounts(adminAccounts);
    }
  };
  
  // Separate function to fetch admin accounts data
  const fetchAdminAccountsData = async () => {
    try {
      setAdminLoading(true);
      setAdminError('');
      console.log('Fetching admin accounts data...');
      
      const response = await getAdminAccounts();
      
      if (response && response.success && Array.isArray(response.data)) {
        console.log(`Successfully loaded ${response.data.length} admin accounts`);
        setAdminAccounts(response.data);
        setFilteredAdminAccounts(response.data);
      } else {
        console.error('Invalid response format:', response);
        setAdminError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Failed to load admin accounts:', err);
      setAdminError(err.message || 'Failed to load admin accounts');
    } finally {
      setAdminLoading(false);
    }
  };
  
  // Manually reload admin data when needed
  const reloadAdminData = () => {
    console.log('Manually reloading admin accounts data');
    fetchAdminAccountsData();
  };
  
  // Handler functions for admin accounts
  const handleCreateAdminAccount = () => {
    setAdminToEdit(null);
    setShowAdminModal(true);
  };
  
  const handleEditAdminAccount = (account) => {
    setAdminToEdit(account);
    setShowAdminModal(true);
  };
  
  const handleDeleteAdminAccount = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      try {
        await deleteAdminAccount(id);
        // Manually refresh the data after deletion
        reloadAdminData();
      } catch (err) {
        setAdminError('Failed to delete admin account');
        console.error(err);
      }
    }
  };
  
  const handleAdminFormSuccess = () => {
    setShowAdminModal(false);
    // Manually refresh the data after form submission
    reloadAdminData();
  };
  
  // User search handler
  const handleUserSearchChange = (e) => {
    const query = e.target.value;
    setUserSearchQuery(query);
    
    // Use debounced search for longer queries
    if (query.length >= 3) {
      debouncedUserSearch(query);
    } else {
      // For short queries, filter client-side
      filterUserResults(query);
    }
  };
  
  // Debounced search for users
  const debouncedUserSearch = useCallback(
    debounce(async (query) => {
      try {
        console.log('Performing user search with query:', query);
        const result = await searchUsers(query);
        setFilteredUsers(result.data || []);
      } catch (error) {
        console.error('User search error:', error);
        setUserError('Failed to search users: ' + (error.message || 'Unknown error'));
      }
    }, 500),
    []
  );
  
  // Client-side filtering for users
  const filterUserResults = (query) => {
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = users.filter(user => 
      user.idNumber?.toLowerCase().includes(lowerQuery) || 
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery) ||
      user.dlNumber?.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredUsers(filtered);
  };
  
  // Fetch user data
  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      const result = await getAllUsers();
      console.log('Fetched users:', result);
      
      const userData = result.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
      setUserError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserError('Failed to load users: ' + (error.message || 'Unknown error'));
    } finally {
      setUserLoading(false);
    }
  };
  
  // Reload user data
  const reloadUserData = () => {
    console.log('Reloading user data');
    fetchUserData();
  };
  
  // Handle creating new user
  const handleCreateUser = () => {
    setUserToEdit(null);
    setShowUserModal(true);
  };
  
  // Handle editing user
  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowUserModal(true);
  };
  
  // Handle deleting user
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(id);
        alert('User deleted successfully');
        reloadUserData();
      } catch (error) {
        console.error('Error deleting user:', error);
        setUserError('Failed to delete user: ' + (error.message || 'Unknown error'));
      }
    }
  };
  
  // Handle form submission for user
  const handleUserFormSuccess = async (formData) => {
    try {
      if (userToEdit) {
        // Update existing user
        await updateUser(userToEdit.idNumber, formData);
        alert('User updated successfully');
      } else {
        // Create new user
        await createUser(formData);
        alert('User created successfully');
      }
      
      setShowUserModal(false);
      reloadUserData();
    } catch (error) {
      console.error('Error saving user:', error);
      setUserError('Failed to save user: ' + (error.message || 'Unknown error'));
    }
  };
  
  if (!admin) return null;
  
  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Dashboard</Title>
        <ButtonGroup>
          <Button primary onClick={handleCreateAccount}>Create Police Account</Button>
          <Button primary onClick={handleCreateAdminAccount}>Create Admin Account</Button>
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
      
      <Section>
        <SectionTitle>Admin Account Management</SectionTitle>
        <Card>
          <h3>Manage Admin Accounts</h3>
          <p>Create, update, and delete admin accounts.</p>
          
          {adminError && <p style={{ color: '#dc3545' }}>{adminError}</p>}
          
          <SearchBar 
            value={adminSearchQuery}
            onChange={handleAdminSearchChange}
          />
          
          {adminSearchQuery.trim() && (
            <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
              Found {filteredAdminAccounts.length} {filteredAdminAccounts.length === 1 ? 'result' : 'results'} for "{adminSearchQuery}"
            </p>
          )}
          
          {adminLoading ? (
            <p>Loading admin accounts...</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="6">No admin accounts found</td>
                  </tr>
                ) : (
                  filteredAdminAccounts.map(account => (
                    <tr key={account._id || account.idNumber}>
                      <td>{account.idNumber}</td>
                      <td>{account.name}</td>
                      <td>{account.email}</td>
                      <td>{account.position}</td>
                      <td>{new Date(account.createdAt).toLocaleString()}</td>
                      <td>
                        <ActionButton onClick={() => handleEditAdminAccount(account)}>Edit</ActionButton>
                        <ActionButton 
                          danger 
                          onClick={() => handleDeleteAdminAccount(account.idNumber)}
                          disabled={account.idNumber === admin.idNumber}
                        >
                          {account.idNumber === admin.idNumber ? 'Current User' : 'Delete'}
                        </ActionButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </Section>
      
      <Section>
        <SectionTitle>User Management</SectionTitle>
        <Card>
          <h3>Manage User Accounts</h3>
          <p>Create, update, and delete user accounts.</p>
          
          <ButtonGroup>
            <Button primary onClick={handleCreateUser}>Add New User</Button>
            <Button onClick={reloadUserData}>Refresh List</Button>
          </ButtonGroup>
          
          {userError && <p style={{ color: '#dc3545' }}>{userError}</p>}
          
          <SearchBar 
            value={userSearchQuery}
            onChange={handleUserSearchChange}
          />
          
          {userSearchQuery.trim() && (
            <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
              Found {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'} for "{userSearchQuery}"
            </p>
          )}
          
          {userLoading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License</th>
                  <th>License Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id || user.idNumber}>
                      <td>{user.idNumber}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.dlNumber}</td>
                      <td>{new Date(user.dlExpireDate).toLocaleDateString()}</td>
                      <td>
                        <ActionButton onClick={() => handleEditUser(user)}>Edit</ActionButton>
                        <ActionButton 
                          danger 
                          onClick={() => handleDeleteUser(user.idNumber)}
                        >
                          Delete
                        </ActionButton>
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
      
      {showAdminModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{adminToEdit ? 'Edit Admin Account' : 'Create Admin Account'}</h3>
              <CloseButton onClick={() => setShowAdminModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <AdminAccountForm 
              accountToEdit={adminToEdit}
              onSuccess={handleAdminFormSuccess}
              onCancel={() => setShowAdminModal(false)}
            />
          </ModalContent>
        </Modal>
      )}
      
      {showUserModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{userToEdit ? 'Edit User Account' : 'Create User Account'}</h3>
              <CloseButton onClick={() => setShowUserModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <UserForm 
              userToEdit={userToEdit}
              onSuccess={handleUserFormSuccess}
              onCancel={() => setShowUserModal(false)}
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