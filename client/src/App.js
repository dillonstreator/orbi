import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Orbtag from "./pages/Orbtag/Orbtag";
import OrbtagInstructions from "./pages/Orbtag/Instructions/Instructions.js";

function App() {
	return (
		<Router>
			<Switch>
				<Route path="/" exact component={Home} />
				<Route path="/orbtag" exact component={Orbtag} />
				<Route path="/orbtag/instructions" component={OrbtagInstructions} />
			</Switch>
		</Router>
	);
}

export default App;
