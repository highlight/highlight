import React, { useState, useEffect } from "react";
import { useFetch } from "use-http";
import { Route, useParams, BrowserRouter as Router } from "react-router-dom";
import { Replayer } from "rrweb";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { useTimer } from "use-timer";

function AppInternal() {
	const { vid } = useParams();
	const [replayer, setReplayer] = useState(undefined);
	const [paused, setPaused] = useState(true);
	const [totalTime, setTotalTime] = useState(0);
	const { time, start, pause, reset } = useTimer({
		interval: 150,
		step: 150
	});

	const { loading, error, data = [] } = useFetch(
		process.env.REACT_APP_BACKEND_URI +
			"/get-events?" +
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
			setTotalTime(r.getMetaData().totalTime);
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
				style={{ padding: 30, height: "90%", width: "80%" }}
				id="player"
			/>
			<div style={{ width: "100%", height: 5 }}>
				<div
					style={{
						height: "100%",
						width: `${Math.floor((time / totalTime) * 100)}%`,
						backgroundColor: "blue",
						transition: "width 1s linear"
					}}
				></div>
			</div>
			<div
				style={{
					backgroundColor: "#242424",
					display: "flex",
					width: "100%",
					height: "10%"
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						width: 100,
						cursor: "pointer"
					}}
				>
					{paused ? (
						<FaPlay
							fill="white"
							style={{ height: 30, width: 30 }}
							onClick={() => {
								replayer.play();
								start();
								setPaused(false);
							}}
						/>
					) : (
						<FaPause
							fill="white"
							style={{ height: 30, width: 30 }}
							onClick={() => {
								replayer.pause();
								reset();
								setPaused(true);
							}}
						/>
					)}
				</div>
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
