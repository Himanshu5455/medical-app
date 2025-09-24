import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/layout/Navbar';
import TriageManagement from './pages/TriageManagement';
import PatientDetailsPage from './pages/PatientDetailsPage';
import ChatbotQuestionnaire from './pages/ChatbotQuestionnaire';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#125A67',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <Router>
            <Routes>
              <Route path="/" element={<ChatbotQuestionnaire />} />
              <Route path="/admin/dashboard" element={<><Navbar /><TriageManagement /></>} />
              <Route path="/admin/patient-detail/:id" element={<><Navbar /><PatientDetailsPage /></>} />
              <Route path="/patient-details/:id" element={<><Navbar /><PatientDetailsPage /></>} />
              <Route path="/admin/login" element={<><Navbar /><LoginPage /></>} />
                <Route path="/login/dashboard" element={<><Navbar /><AdminDashboard /></>} />
                 <Route path="/settings" element={<><Navbar /><SettingsPage /></> } />

            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
