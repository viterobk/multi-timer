import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import './App.css';
import Home from './Home';
import EditTimer from './EditTimer';
import RunTimer from './RunTimer';
import timersStore from '../Stores/timersStore';

export default () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/edit' element={<EditTimer onUpdate={timersStore.update} />} />
          <Route path='/edit/:key' element={<EditTimer onUpdate={timersStore.update} />} />
          <Route path='/run/:key' element={<RunTimer />} />
        </Routes>
      </Router>
    </div>
  );
}
