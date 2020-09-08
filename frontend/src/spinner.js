import React from "react";
import { ImpulseSpinner } from "react-spinners-kit";

export const Spinner = props => {
	return (
		<div
			style={{
				height: "100vh",
				width: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			}}
		>
			<ImpulseSpinner frontColor="#5629C6" backColor="#5629C6" />
		</div>
	);
};
