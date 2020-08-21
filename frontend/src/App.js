import React, { useState, useEffect } from "react";
import { useFetch } from "use-http";
import { Route, useParams, BrowserRouter as Router } from "react-router-dom";
import { Replayer } from "rrweb";

function AppInternal() {
	const { vid } = useParams();
	const [replayer, setReplayer] = useState(undefined);

	const { loading, error, data = [] } = useFetch(
		process.env.REACT_APP_BACKEND_URI + "/get-events?" +
			new URLSearchParams({
				vid: vid
			}),
		{},
		[]
	);

	useEffect(() => {
		if (data && data.events && data.events.length > 1) {
			let r = new Replayer(data.events, {
				root: document.getElementById("player")
			});
			setReplayer(r);
		}
	}, [data]);

	if (loading) {
		return <p>loading...</p>;
	}
	if (error) {
		return <p>{error.toString()}</p>;
	}
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center"
			}}
		>
			<div
				style={{ padding: 30, height: "80%", width: "80%" }}
				id="player"
			/>
			<div style={{ display: "flex" }}>
				<button onClick={() => replayer.play()}>play</button>
				<button onClick={() => replayer.pause()}>pause</button>
			</div>
		</div>
	);
}

const App = props => {
	return (
		<Router>
			<Route path="/:vid">
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100vh",
						width: "100vw",
						backgroundColor: "#F3F5FF"
					}}
				>
					<AppInternal />
				</div>
			</Route>
		</Router>
	);
};

export default App;
