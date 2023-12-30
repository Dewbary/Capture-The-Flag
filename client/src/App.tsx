import "./App.css";
import Game from "./game/page";
import { Provider } from "react-redux";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
      <div className="h-[800px] w-[1500px]">
        <Game />
      </div>
    </Provider>
  );
}

export default App;
