import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Orbtag from "./pages/Orbtag/Orbtag";

function App() {
	return (
		<Router>
			<Switch>
				<Route path="/" exact component={Home} />
				<Route path="/orbtag" component={Orbtag} />
			</Switch>
		</Router>
	);
}

export default App;
