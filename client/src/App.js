import Navigator from "./Navigator";
import Header from "./Components/Header";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
function App() {
  const theme = createMuiTheme({
    typography: {
      fontFamily: [
        "Nunito",
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Header />
        <Navigator />
      </div>
    </ThemeProvider>
  );
}

export default App;
