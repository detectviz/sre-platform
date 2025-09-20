import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/design-system.css';
import './styles/components.css';
import './styles/global.css';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
