import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Components/App';
import reportWebVitals from './reportWebVitals';
import { createBrowserHistory } from 'history';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from './theme';

const history = createBrowserHistory();

ReactDOM.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>,
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
