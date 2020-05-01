import React, { useEffect } from "react";

import styles from "./styles.module.scss";

function App() {
	useEffect(() => {
		fetch("/health")
			.then(console.log)
			.catch(console.error);
	}, []);

	return (
		<div className={styles.App}>
			<h1>Orbi</h1>
		</div>
	);
}

export default App;
