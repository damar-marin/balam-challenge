import React from "react";
import ExchangeComponent from "./components/ExchangeComponent";

function App() {
  return (
    <div style={appStyles.container}>
      <ExchangeComponent />
    </div>
  );
}

const appStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
};

export default App;
