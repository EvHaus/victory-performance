import React, {PropTypes, PureComponent} from 'react';
import moment from 'moment';
import {VictoryBar} from 'victory';

const STYLE_WRAPPER = {bottom: 0, left: 0, position: 'absolute', right: 0, top: 0};
const STYLE_ROW = {borderBottom: '1px solid black ', height: 83, position: 'relative'};
const STYLE_TITLE = {left: 10, margin: 0, position: 'absolute', top: 10}
const STYLE_SLIDER = {display: 'block', margin: 20};

export default class VictoryExample extends PureComponent {
	static displayName = "VictoryExample";

	static propTypes = {
		data: PropTypes.array,
		machineIndex: PropTypes.number,
		maxIndex: PropTypes.number,
		minXTotal: PropTypes.number
	};

	componentDidMount () {
		window.addEventListener('resize', this._handleResize)
	}

	componentWillUnmount () {
		window.removeEventListener('resize', this._handleResize)
	}

	constructor (props) {
		super(props);

		this.state = {
			pan: 0,
			range: 0,
			width: window.innerWidth,
			xMax: moment("2015-12-17T16:27:25-08:00").toDate(),
			xMin: this.props.minXTotal
		}
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
		const {data} = this.props;
		const {width, xMax, xMin} = this.state;

		return Object.keys(data.machines).map((i) => {
			const machine = data.machines[i];
			const chartData = machine.solution_vars.volume.values;
			const yMax = machine.solution_vars.volume.max;
			const yMin = machine.solution_vars.volume.min;
			const style = {...STYLE_ROW, width};
			const domain = {x: [xMin, xMax], y: [yMin, yMax]};
			const barStyle = {data: {fill: "#00a3de"}};

			return (
				<div style={style}>
					<p style={STYLE_TITLE}>{machine.name}</p>
					<VictoryBar
						data={this._getFilteredData(chartData)}
						domain={domain}
						height={83}
						padding={0}
						scale="time"
						style={barStyle}
						width={width}
						x="time"
						y="value" />
				</div>
			);
		});
	}

	_getFilteredData (chartData) {
		const {xMin, xMax} = this.state;
		const filtered = [];
		const xMinTime = xMin.getTime();
		const xMaxTime = xMax.getTime();

		for (let i = 0, l = chartData.length; i < l; i++) {
			const time = chartData[i].time.getTime();
			if (time < xMinTime) continue;
			filtered.push(chartData[i]);
			if (time > xMaxTime) break;
		}
		return filtered;
	}

	_handleRangeChange = (event) => {
		const {data, machineIndex, maxIndex} = this.props;
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
		const {data, machineIndex, maxIndex} = this.props;
		const range = 100;
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