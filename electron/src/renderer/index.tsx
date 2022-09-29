import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const isPlayer = container?.className === 'player';

const root = createRoot(container);
root.render(<App player={isPlayer} />);
