import { Provider } from "react-redux";
import "./App.css";
import AuthForm from "./components/AuthForm";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <AuthForm />
      </div>
    </Provider>
  );
}

export default App;
