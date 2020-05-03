import React, { useState, useEffect } from "react";
import validator from "validator";
import { onchangeText } from "../../utils/on-change";
import { withRouter } from "react-router-dom";

function getColor() {
	return (
		"hsl(" +
		360 * Math.random() +
		"," +
		(155 * Math.random()) +
		"%," +
		(75 + 10 * Math.random()) +
		"%)"
	);
}

const colorO = getColor();
const colorR = getColor();
const colorB = getColor();
const colorI = getColor();

const Home = ({ history }) => {
	const [name, setName] = useState("");
	const [submitting, setSubmitting] = useState("");
	const [loading, setLoading] = useState(true);
	const [color, setColor] = useState(getColor());

	useEffect(() => {
		fetch("/api/me")
			.then((res) => res.json())
			.then(({ sessionId }) => {
				if (sessionId) history.push("/orbtag");
				else setLoading(false);
			});
	}, []);

	const submitName = () => {
		if (submitting) return;
		if (!name) {
			alert("Please enter your username");
			return;
		}
		if (!validator.isAlphanumeric(name)) {
			alert("name must contain only alphanumeric characters");
			return;
		}

		setSubmitting(true);
		fetch("/api/users", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, color }),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					alert(res.error);
				} else {
					history.push("/orbtag", { name });
				}
			})
			.catch(console.error)
			.finally(() => setSubmitting(false));
	};

	const randomColor = () => {
		setColor(getColor());
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				marginTop: 100,
			}}
		>
			<h1 style={{ fontSize: "4em" }}>
				<span style={{ color: colorO }}>o</span>
				<span style={{ color: colorR }}>r</span>
				<span style={{ color: colorB }}>b</span>
				<span style={{ color: colorI }}>i</span>
			</h1>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<div
					style={{
						backgroundColor: color,
						height: 50,
						width: 50,
						borderRadius: 50,
					}}
				/>
				<button style={{ margin: 5, fontSize: 16 }} onClick={randomColor}>
					New Color
				</button>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<p style={{ fontSize: 20 }}>name</p>
				<input
					style={{ fontSize: 25, padding: 5, borderRadius: 5, textAlign: "center" }}
					type="text"
					value={name}
					onChange={onchangeText(setName)}
				/>
				<button style={{ margin: 5, fontSize: 25 }} onClick={submitName}>
					Play!
				</button>
			</div>
		</div>
	);
};

export default withRouter(Home);
