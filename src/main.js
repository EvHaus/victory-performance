import React, {Component, PropTypes} from 'react';
import ReactDOM, {render} from 'react-dom';
import data from './../data/data';
import moment from 'moment';
import {VictoryBar} from 'victory';

// Convert date strings to Date objects
let maxIndex = -1, machineIndex = 0, minXTotal, maxXTotal;
Object.keys(data.machines).forEach((id) => {
	data.machines[id].solution_vars.volume.values = data.machines[id].solution_vars.volume.values.map((d, i) => {
		const time = moment(d.time).toDate();
		if (!minXTotal) minXTotal = time;
		maxXTotal = time;
		if (i > maxIndex) {
			machineIndex = id;
			maxIndex = i;
		}
		return {...d, time};
	});
});

const STYLE_WRAPPER = {bottom: 0, left: 0, position: 'absolute', right: 0, top: 0};
const STYLE_ROW = {borderBottom: '1px solid black ', height: 83, position: 'relative'};
const STYLE_TITLE = {left: 10, margin: 0, position: 'absolute', top: 10}
const STYLE_SLIDER = {display: 'block', margin: 20};

export default class App extends Component {
	static displayName = "App";

	componentDidMount () {
		window.addEventListener('resize', this._handleResize)
	}

	componentWillUnmount () {
		window.removeEventListener('resize', this._handleResize)
	}

	state = {
		pan: 0,
		range: 0,
		width: window.innerWidth,
		xMax: moment("2015-12-17T16:28:40-08:00").toDate(),
		xMin: minXTotal
	}

	render () {
		const {pan, range} = this.state;
		return (
			<div style={STYLE_WRAPPER}>
				{this._renderCharts()}
				<label style={STYLE_SLIDER}>
					Pan the domain range:
					<input onChange={this._handleRangePan} type="range" value={pan} />
				</label>
				<label style={STYLE_SLIDER}>
					Increase the domain range:
					<input onChange={this._handleRangeChange} type="range" value={range} />
				</label>
			</div>
		);
	}

	_renderCharts () {
		const {width, xMax, xMin} = this.state;

		return Object.keys(data.machines).map((i) => {
			const machine = data.machines[i];
			const chartData = machine.solution_vars.volume.values;
			const yMax = machine.solution_vars.volume.max;
			const yMin = machine.solution_vars.volume.min;

			return (
				<div style={{...STYLE_ROW, width}}>
					<p style={STYLE_TITLE}>{machine.name}</p>
					<VictoryBar
						data={chartData}
						domain={{x: [xMin, xMax], y: [yMin, yMax]}}
						height={83}
						padding={0}
						scale="time"
						style={{data: {fill: "#00a3de"}}}
						width={width}
						x="time"
						y="value" />
				</div>
			);
		});
	}

	_handleRangeChange = (event) => {
		const range = event.target.value;
		const rangeIndex = Math.ceil(maxIndex * range / 100);
		const xMin = data.machines[machineIndex].solution_vars.volume.values[0].time;
		const xMax = data.machines[machineIndex].solution_vars.volume.values[rangeIndex].time;

		this.setState({
			pan: 0,
			range,
			xMin,
			xMax
		});
	}

	_handleRangePan = (event) => {
		const range = 10;
		const pan = event.target.value;
		const panIndex = Math.ceil(maxIndex * pan / 100);
		const xMin = data.machines[machineIndex].solution_vars.volume.values[Math.max(0, panIndex - range)].time;
		const xMax = data.machines[machineIndex].solution_vars.volume.values[panIndex].time;

		this.setState({
			pan,
			range: 0,
			xMin,
			xMax
		});
	}

	_handleResize = (event) => {
		this.setState({width: window.innerWidth});
	}
}

render(<App />, document.getElementById('App'));