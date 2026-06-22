import './index.css';
import App from './components/App';
import { UIConfigProvider } from './components/UIConfigContext';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

const root = createRoot(document.getElementById('root')!);
root.render(
  <Router>
    <UIConfigProvider>
      <App />
    </UIConfigProvider>
  </Router>,
);
