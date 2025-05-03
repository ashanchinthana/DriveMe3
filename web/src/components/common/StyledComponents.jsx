import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Container components
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #f8f9fa;
`;

export const FormContainer = styled.div`
  width: 100%;
`;

// Typography components
export const Title = styled.h2`
  color: #333;
  margin-bottom: ${props => props.withSubtitle ? '0.5rem' : '1.5rem'};
`;

export const Subtitle = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Form components
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  color: #555;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme || '#007bff'};
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme || '#007bff'};
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme || '#007bff'};
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

// Button components
export const Button = styled.button`
  background-color: ${props => props.variant === 'primary' ? '#007bff' : 
                   props.variant === 'success' ? '#28a745' : 
                   props.variant === 'danger' ? '#dc3545' : 
                   props.variant === 'warning' ? '#ffc107' : 
                   props.variant === 'dark' ? '#343a40' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  flex: ${props => props.secondary ? '0 0 48%' : '1'};
  margin-top: ${props => props.mt || (props.secondary ? '0' : '1rem')};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#0069d9' : 
                      props.variant === 'success' ? '#218838' : 
                      props.variant === 'danger' ? '#c82333' : 
                      props.variant === 'warning' ? '#e0a800' : 
                      props.variant === 'dark' ? '#23272b' : '#5a6268'};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: ${props => props.justifyContent || 'space-between'};
  margin-top: 1rem;
`;

// Navigation and link components
export const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const NavLink = styled(Link)`
  display: block;
  margin-top: 1rem;
  text-align: center;
  color: ${props => props.color || '#6c757d'};
  font-size: ${props => props.fontSize || '0.9rem'};
  
  &:hover {
    color: ${props => props.hoverColor || '#343a40'};
  }
`;

// Message components
export const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #f8d7da;
  border-radius: 4px;
  text-align: center;
`;

export const SuccessMessage = styled.div`
  color: #28a745;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #d4edda;
  border-radius: 4px;
  text-align: center;
`;

// Multi-step form components
export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? props.activeColor || '#007bff' : '#dee2e6'};
  margin: 0 5px;
  transition: background-color 0.3s ease;
  cursor: pointer;
`;

export const StepTitle = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
`;

// Card components
export const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const CardHeader = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;

export const CardTitle = styled.h3`
  margin: 0;
  color: #333;
`;

export const CardBody = styled.div``;

export const CardFooter = styled.div`
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
  display: flex;
  justify-content: ${props => props.justifyContent || 'flex-end'};
`;

// Grid components
export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.75rem;
`;

export const Col = styled.div`
  flex: ${props => props.size ? `0 0 ${(props.size / 12) * 100}%` : '1'};
  max-width: ${props => props.size ? `${(props.size / 12) * 100}%` : '100%'};
  padding: 0 0.75rem;
`;

// Badge
export const Badge = styled.span`
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  background-color: ${props => props.variant === 'primary' ? '#007bff' : 
                    props.variant === 'success' ? '#28a745' : 
                    props.variant === 'danger' ? '#dc3545' : 
                    props.variant === 'warning' ? '#ffc107' : 
                    props.variant === 'secondary' ? '#6c757d' : '#17a2b8'};
  color: white;
`;

// Alert
export const Alert = styled.div`
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background-color: ${props => props.variant === 'primary' ? '#cce5ff' : 
                    props.variant === 'success' ? '#d4edda' : 
                    props.variant === 'danger' ? '#f8d7da' : 
                    props.variant === 'warning' ? '#fff3cd' : 
                    props.variant === 'secondary' ? '#e2e3e5' : '#d1ecf1'};
  border-color: ${props => props.variant === 'primary' ? '#b8daff' : 
                props.variant === 'success' ? '#c3e6cb' : 
                props.variant === 'danger' ? '#f5c6cb' : 
                props.variant === 'warning' ? '#ffeeba' : 
                props.variant === 'secondary' ? '#d6d8db' : '#bee5eb'};
  color: ${props => props.variant === 'primary' ? '#004085' : 
              props.variant === 'success' ? '#155724' : 
              props.variant === 'danger' ? '#721c24' : 
              props.variant === 'warning' ? '#856404' : 
              props.variant === 'secondary' ? '#383d41' : '#0c5460'};
`; 