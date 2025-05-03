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
  ButtonGroup,
  StepIndicator,
  StepDot,
  StepTitle,
  Card,
  CardBody
} from '../common/StyledComponents';
import { register } from '../../services/authService';

const stepTitles = [
  "Personal Information",
  "Driver's License",
  "Account Setup"
];

// Model validation rules
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    message: 'Full name is required and must be at least 2 characters'
  },
  idNumber: {
    required: true,
    minLength: 3,
    message: 'ID number is required and must be at least 3 characters'
  },
  phone: {
    required: true,
    minLength: 10,
    message: 'Phone number is required and must be at least 10 digits'
  },
  dlNumber: {
    required: true,
    minLength: 5,
    message: 'Driver license number is required and must be at least 5 characters'
  },
  dlExpireDate: {
    required: true,
    message: 'License expiry date is required'
  },
  email: {
    required: true,
    pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password is required and must be at least 6 characters'
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    phone: '',
    dlNumber: '',
    dlExpireDate: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const navigate = useNavigate();
  
  const { 
    name, 
    idNumber, 
    phone, 
    dlNumber, 
    dlExpireDate, 
    email, 
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
      const nameError = getFieldErrorMessage('name', name);
      const idNumberError = getFieldErrorMessage('idNumber', idNumber);
      const phoneError = getFieldErrorMessage('phone', phone);
      
      if (nameError) {
        setError(nameError);
        return;
      }
      
      if (idNumberError) {
        setError(idNumberError);
        return;
      }
      
      if (phoneError) {
        setError(phoneError);
        return;
      }
    } else if (currentStep === 2) {
      const dlNumberError = getFieldErrorMessage('dlNumber', dlNumber);
      const dlExpireDateError = getFieldErrorMessage('dlExpireDate', dlExpireDate);
      
      if (dlNumberError) {
        setError(dlNumberError);
        return;
      }
      
      if (dlExpireDateError) {
        setError(dlExpireDateError);
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
      
      await register(registrationData);
      navigate('/login');
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      console.error('User registration error:', err);
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
            
            <Button 
              type="button" 
              onClick={nextStep}
              variant="success"
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
              <Label htmlFor="dlNumber">Driver License Number</Label>
              <Input
                type="text"
                id="dlNumber"
                name="dlNumber"
                value={dlNumber}
                onChange={onChange}
                placeholder="Enter your driver license number"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="dlExpireDate">License Expiry Date</Label>
              <Input
                type="date"
                id="dlExpireDate"
                name="dlExpireDate"
                value={dlExpireDate}
                onChange={onChange}
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
                variant="success"
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
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
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
                variant="success"
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
          <Title>Create Account</Title>
          
          <StepIndicator>
            {stepTitles.map((_, index) => (
              <StepDot 
                key={index} 
                active={currentStep === index + 1}
                activeColor="#28a745"
                onClick={() => goToStep(index + 1)}
              />
            ))}
          </StepIndicator>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Form onSubmit={onSubmit}>
            {renderStep()}
          </Form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Already have an account? <StyledLink to="/login">Login</StyledLink>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Register; 