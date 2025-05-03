import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PageContainer, 
  Title, 
  Subtitle,
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button, 
  ErrorMessage, 
  StyledLink,
  NavLink,
  Card,
  CardBody
} from '../common/StyledComponents';

import { loginAdmin } from '../../services/adminService';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    idNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { idNumber, password } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validateForm = () => {
    if (!idNumber.trim()) {
      setError('Admin ID is required');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await loginAdmin({ idNumber, password });
      
      if (response) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <Card>
        <CardBody>
           
          <Title withSubtitle style={{ textAlign: 'center' }}>Admin Login </Title>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Form onSubmit={onSubmit}>
            <FormGroup>
              <Label htmlFor="idNumber">Admin ID</Label>
              <Input
                type="text"
                id="idNumber"
                name="idNumber"
                value={idNumber}
                onChange={onChange}
                placeholder="Enter your admin ID"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                minLength="6"
                required
              />
            </FormGroup>
            
            <Button 
              type="submit" 
              disabled={loading} 
              variant="dark"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Don't have an account? <StyledLink to="/admin/register">Register</StyledLink>
          </div>
          
          <NavLink to="/">
            ← Back to homepage
          </NavLink>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default AdminLogin; 