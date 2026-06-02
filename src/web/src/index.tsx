import 'semantic-ui-less/semantic.less';
import App from './components/App';
import { UIConfigProvider } from './components/UIConfigContext';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

render(
  <Router>
    <UIConfigProvider>
      <App />
    </UIConfigProvider>
  </Router>,
  document.querySelector('#root'),
);
