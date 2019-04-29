import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import {
	TextInput,
	Textarea,
	Button,
	Icon
} from "@contentful/forma-36-react-components";
import { init } from "contentful-ui-extensions-sdk";
import styled, { css } from "styled-components";
import short from "short-uuid";
import "@contentful/forma-36-react-components/dist/styles.css";
import "./index.css";

const Row = styled.div`
	display: flex;
	margin: 0 -0.5rem;
`;

const Column = styled.div`
	flex-basis: 30px;
	align-items: middle;
	padding: 0.5rem;
	${props =>
		props.flex &&
		css`
			flex: ${props.flex};
		`}

	${props =>
		props.centered &&
		css`
			display: flex;
			justify-content: center;
			align-items: center;
		`}
`;

class App extends React.Component {
	static propTypes = {
		sdk: PropTypes.object.isRequired
	};

	detachExternalChangeHandler = null;

	constructor(props) {
		super(props);
		this.state = {
			value: props.sdk.field.getValue()
		};
	}

	componentDidMount() {
		this.props.sdk.window.startAutoResizer();

		// Handler for external field value changes (e.g. when multiple authors are working on the same entry).
		this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(
			this.onExternalChange
		);
	}

	componentWillUnmount() {
		if (this.detachExternalChangeHandler) {
			this.detachExternalChangeHandler();
		}
	}

	onExternalChange = value => {
		this.setState({ value });
	};

	onKeyChange = (e, oldKey) => {
		const { value } = this.state;
		const newKey = e.currentTarget.value.replace(/\s/gi, "-");
		const keys = Object.keys(value);
		const res = {};
		const isDuplicateKey = Boolean(keys.includes(newKey));

		keys.map(key => {
			res[newKey && key === oldKey && !isDuplicateKey ? newKey : key] =
				value[key];
		});

		this.setValue(res);
	};

	onValueChange = (e, key) => {
		const { value } = this.state;
		const text = e.currentTarget.value;

		value[key] = text;

		this.setValue(value);
	};

	addRow = () => {
		const value = {
			...this.state.value,
			[short.generate()]: ""
		};
		this.setValue(value);
	};

	removeRow = key => {
		const value = this.state.value;
		delete value[key];
		this.setValue(value);
	};

	setValue = value => {
		this.setState({ value });
		this.props.sdk.field.setValue(value);
	};

	render() {
		const { value } = this.state;
		// console.log(value);
		return (
			<div>
				{Object.keys(value || {}).map((key, i) => {
					return (
						<Row key={i}>
							<Column flex={1}>
								<TextInput
									width="full"
									type="text"
									id="my-field"
									value={key}
                  onChange={e => this.onKeyChange(e, key)}
                  placeholder="slug"
								/>
							</Column>
							<Column flex={3}>
								<Textarea
									width="full"
									type="text"
									id="my-field"
									value={value[key]}
                  onChange={e => this.onValueChange(e, key)}
                  placeholder="Content"
								/>
							</Column>
							<Column centered>
								<Button
									onClick={() => this.removeRow(key)}
									buttonType="muted"
									className="btn-caution"
									size="small"
									icon="Close"
									title="Delete Row"
								/>
							</Column>
						</Row>
					);
        })}
        				<Row>
					<Column flex={1} centered>
						<Button
							icon="Plus"
							onClick={this.addRow}
							buttonType="muted"
							className="btn-caution"
							size="small"
						>
							Add Field
						</Button>
					</Column>
				</Row>
			</div>
		);
	}
}

init(sdk => {
	ReactDOM.render(<App sdk={sdk} />, document.getElementById("root"));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
