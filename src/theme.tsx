import { red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';
import {
  yellow,
  green,
} from '@mui/material/colors';
// A custom theme for this app
const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: yellow[500],
    },
    secondary: {
      main: green[500],
    }
  },
});
export default theme;