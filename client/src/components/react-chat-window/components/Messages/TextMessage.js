import React from "react";
import Linkify from "react-linkify";

const TextMessage = (props) => {
	const style = props.style || {};
	return (
		<div className="sc-message--text" style={style}>
			{
				<Linkify properties={{ target: "_blank" }}>
					{props.data.text}
				</Linkify>
			}
		</div>
	);
};

export default TextMessage;
