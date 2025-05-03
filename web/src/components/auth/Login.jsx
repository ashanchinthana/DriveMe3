import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PageContainer, 
  Title, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button, 
  ErrorMessage, 
  StyledLink,
  Card,
  CardBody
} from '../common/StyledComponents';

import { login } from '../../services/authService';

const Login = () => {
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
      setError('ID number is required');
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
      const response = await login({ idNumber, password });
      
      if (response) {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <Card>
        <CardBody>
          <Title>Login to DriveMe</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Form onSubmit={onSubmit}>
            <FormGroup>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                type="text"
                id="idNumber"
                name="idNumber"
                value={idNumber}
                onChange={onChange}
                placeholder="Enter your ID number"
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
              variant="primary"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Don't have an account? <StyledLink to="/register">Register</StyledLink>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Login; 