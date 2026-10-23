import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Components/App';
import reportWebVitals from './reportWebVitals';
import { createBrowserHistory } from 'history';
import { ThemeModeProvider } from './ThemeModeProvider';
import { startBeepPlayer } from './Sounds/beepPlayer';

const history = createBrowserHistory();
startBeepPlayer();

ReactDOM.render(
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>,
  document.getElementById('root')
);

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.log('ServiceWorker registration failed:', error);
    });
  });
}

reportWebVitals();
