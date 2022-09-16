import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

const Player = ({ player }: { player: boolean }) => {
  return (
    <div>
      {player ? 'PLAYER' : 'MAIN'}
      <div>player</div>
    </div>
  );
};

export default function App({ player }: { player: boolean }) {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Player />} />
      </Routes>
    </Router>
  );
}
