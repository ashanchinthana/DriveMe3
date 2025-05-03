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
  ButtonGroup,
  StepIndicator,
  StepDot,
  StepTitle,
  Card,
  CardBody
} from '../common/StyledComponents';
import { registerAdmin } from '../../services/adminService';

const stepTitles = [
  "Identification",
  "Contact Information",
  "Account Setup"
];

// Model validation rules
const validationRules = {
  idNumber: {
    required: true,
    minLength: 3,
    message: 'ID number is required and must be at least 3 characters'
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Full name is required and must be at least 2 characters'
  },
  email: {
    required: true,
    pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    minLength: 10,
    message: 'Phone number is required and must be at least 10 digits'
  },
  position: {
    required: true,
    minLength: 2,
    message: 'Position is required and must be at least 2 characters'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password is required and must be at least 6 characters'
  }
};

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    idNumber: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const navigate = useNavigate();
  
  const { 
    idNumber, 
    name, 
    email, 
    phone, 
    position, 
    password, 
    confirmPassword 
  } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate a field based on rules
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return true;
    
    if (rules.required && (!value || value.trim() === '')) {
      return false;
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return false;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return false;
    }
    
    return true;
  };

  // Get field error message
  const getFieldErrorMessage = (fieldName, value) => {
    if (!validateField(fieldName, value)) {
      return validationRules[fieldName].message;
    }
    return '';
  };
  
  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const idNumberError = getFieldErrorMessage('idNumber', idNumber);
      const nameError = getFieldErrorMessage('name', name);
      const positionError = getFieldErrorMessage('position', position);
      
      if (idNumberError) {
        setError(idNumberError);
        return;
      }
      
      if (nameError) {
        setError(nameError);
        return;
      }
      
      if (positionError) {
        setError(positionError);
        return;
      }
    } else if (currentStep === 2) {
      const emailError = getFieldErrorMessage('email', email);
      const phoneError = getFieldErrorMessage('phone', phone);
      
      if (emailError) {
        setError(emailError);
        return;
      }
      
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };
  
  const goToStep = (step) => {
    setCurrentStep(step);
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final validation for all fields
    for (const field in validationRules) {
      const errorMsg = getFieldErrorMessage(field, formData[field]);
      if (errorMsg) {
        setError(errorMsg);
        return;
      }
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      
      await registerAdmin(registrationData);
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      console.error('Admin registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render different form steps
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            <StepTitle>{stepTitles[currentStep - 1]}</StepTitle>
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Enter your full name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="position">Position</Label>
              <Input
                type="text"
                id="position"
                name="position"
                value={position}
                onChange={onChange}
                placeholder="Enter your position or title"
                required
              />
            </FormGroup>
            
            <Button 
              type="button" 
              onClick={nextStep}
              variant="dark"
            >
              Next
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <StepTitle>{stepTitles[currentStep - 1]}</StepTitle>
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email address"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={onChange}
                placeholder="Enter your phone number"
                required
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button 
                type="button" 
                onClick={prevStep} 
                secondary
                variant="secondary"
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                secondary
                variant="dark"
              >
                Next
              </Button>
            </ButtonGroup>
          </>
        );
      case 3:
        return (
          <>
            <StepTitle>{stepTitles[currentStep - 1]}</StepTitle>
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter password"
                minLength="6"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm password"
                minLength="6"
                required
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button 
                type="button" 
                onClick={prevStep} 
                secondary
                variant="secondary"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                secondary
                variant="dark"
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </ButtonGroup>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <PageContainer>
      <Card>
        <CardBody>
          <Title withSubtitle>Admin Registration</Title>
          <Subtitle>Create an account to manage police users</Subtitle>
          
          <StepIndicator>
            {stepTitles.map((_, index) => (
              <StepDot 
                key={index} 
                active={currentStep === index + 1}
                activeColor="#343a40"
                onClick={() => goToStep(index + 1)}
              />
            ))}
          </StepIndicator>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Form onSubmit={onSubmit}>
            {renderStep()}
          </Form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Already have an account? <StyledLink to="/admin/login">Login</StyledLink>
          </div>
          
          <NavLink to="/">
            ← Back to homepage
          </NavLink>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default AdminRegister; 