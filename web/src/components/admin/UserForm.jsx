import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage
} from '../common/StyledComponents';

const FormContainer = styled.div`
  padding: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const UserForm = ({ userToEdit, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    name: '',
    email: '',
    phone: '',
    dlNumber: '',
    dlExpireDate: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isEditing = !!userToEdit;
  
  useEffect(() => {
    // If editing, populate the form with user data
    if (userToEdit) {
      // Format date for input field
      let formattedExpireDate = '';
      if (userToEdit.dlExpireDate) {
        const date = new Date(userToEdit.dlExpireDate);
        formattedExpireDate = date.toISOString().split('T')[0];
      }

      setFormData({
        idNumber: userToEdit.idNumber || '',
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        dlNumber: userToEdit.dlNumber || '',
        dlExpireDate: formattedExpireDate,
        password: '' // Don't populate password for security
      });
    }
  }, [userToEdit]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validateForm = () => {
    if (!formData.idNumber) {
      setError('ID Number is required');
      return false;
    }
    
    if (!formData.name) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    
    if (!formData.dlNumber) {
      setError('Driver License Number is required');
      return false;
    }
    
    if (!formData.dlExpireDate) {
      setError('License expiration date is required');
      return false;
    }
    
    if (!isEditing && !formData.password) {
      setError('Password is required for new users');
      return false;
    }
    
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // We'll call the appropriate API endpoint in the parent component
      onSuccess(formData);
    } catch (err) {
      setError(err.message || 'Error saving user. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <FormContainer>
      <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            disabled={isEditing}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="dlNumber">Driver License Number</Label>
          <Input
            type="text"
            id="dlNumber"
            name="dlNumber"
            value={formData.dlNumber}
            onChange={handleChange}
            disabled={isEditing}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="dlExpireDate">License Expiration Date</Label>
          <Input
            type="date"
            id="dlExpireDate"
            name="dlExpireDate"
            value={formData.dlExpireDate}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">
            {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
          />
        </FormGroup>
        
        <ButtonGroup>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Button>
          <Button type="button" secondary onClick={onCancel}>
            Cancel
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default UserForm; 