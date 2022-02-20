import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import './App.css';
import Home from './Home';
import EditTimer from './EditTimer';
import RunTimer from './RunTimer';
import TopBar from './TopBar';

export default () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/edit' element={<EditTimer />} />
          <Route path='/edit/:key' element={<EditTimer />} />
          <Route path='/run/:key' element={<RunTimer />} />
        </Routes>
      </Router>
    </div>
  );
}
