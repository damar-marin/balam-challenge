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
    background: "linear-gradient(to top, gray, white)", 
  },
};

export default App;