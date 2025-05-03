import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createAdminAccount, updateAdminAccount } from '../../services/adminService';

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

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

const Button = styled.button`
  background-color: ${props => props.primary ? '#343a40' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background-color: ${props => props.primary ? '#23272b' : '#5a6268'};
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const AdminAccountForm = ({ accountToEdit, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isEditing = !!accountToEdit;
  
  useEffect(() => {
    // If editing, populate the form with account data
    if (accountToEdit) {
      setFormData({
        idNumber: accountToEdit.idNumber || '',
        name: accountToEdit.name || '',
        email: accountToEdit.email || '',
        phone: accountToEdit.phone || '',
        position: accountToEdit.position || '',
        password: '' // Don't populate password for security
      });
    }
  }, [accountToEdit]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form data
    if (!formData.idNumber || !formData.name || !formData.email || !formData.phone || !formData.position || (!isEditing && !formData.password)) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditing) {
        // Only include password if it's been changed
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await updateAdminAccount(accountToEdit.idNumber, updateData);
      } else {
        await createAdminAccount(formData);
      }
      
      // Notify parent of success
      onSuccess();
      
    } catch (err) {
      setError(err.message || 'Failed to save admin account');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormGroup>
        <Label htmlFor="idNumber">Admin ID</Label>
        <Input
          type="text"
          id="idNumber"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          disabled={isEditing} // Can't edit ID if updating
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
        <Label htmlFor="position">Position</Label>
        <Input
          type="text"
          id="position"
          name="position"
          value={formData.position}
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
          required={!isEditing} // Only required for new accounts
        />
      </FormGroup>
      
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button type="button" onClick={onCancel}>Cancel</Button>
        <Button primary type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </Form>
  );
};

export default AdminAccountForm; 