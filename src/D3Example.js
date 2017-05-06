import React, {Component, PropTypes} from 'react';
import * as d3 from 'd3';
import moment from 'moment';

const STYLE_WRAPPER = {bottom: 0, left: 0, position: 'absolute', right: 0, top: 0};
const STYLE_ROW = {borderBottom: '1px solid black ', height: 83, position: 'relative'};
const STYLE_TITLE = {left: 10, margin: 0, position: 'absolute', top: 10}
const STYLE_SLIDER = {display: 'block', margin: 20};

export default class D3Example extends Component {
	static displayName = "D3Example";

	static propTypes = {
		data: PropTypes.array,
		machineIndex: PropTypes.number,
		maxIndex: PropTypes.number,
		minXTotal: PropTypes.number
	};

	constructor (props) {
		super(props);

		this.nodes = {};
		this.svg = {};
		this.x = {};
		this.y = {};

		this.state = {
			pan: 0,
			range: 0,
			width: window.innerWidth,
			xMax: moment("2015-12-17T16:27:25-08:00").toDate(),
			xMin: this.props.minXTotal
		}
	}

	componentDidMount () {
		this._setupScales()
		this._renderCharts();
		window.addEventListener('resize', this._handleResize)
	}

	componentDidUpdate () {
		this._renderCharts();
	}

	componentWillUnmount () {
		window.removeEventListener('resize', this._handleResize)
	}

	render () {
		const {pan, range} = this.state;
		return (
			<div style={STYLE_WRAPPER}>
				{this._renderChartBodies()}
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

	_renderChartBodies () {
		const {data} = this.props;
		const {width, xMax, xMin} = this.state;

		return Object.keys(data.machines).map((i) => {
			const machine = data.machines[i];
			const style = {...STYLE_ROW, width};

			return (
				<div style={style}>
					<p style={STYLE_TITLE}>{machine.name}</p>
					<div ref={(node) => { this.nodes[i] = node; }} />
				</div>
			);
		});
	}

	_renderCharts () {
		const {data} = this.props;
		const {xMin, xMax, width} = this.state;
		const height = 83;

		Object.keys(data.machines).forEach((i) => {
			const machine = data.machines[i];
			const chartData = machine.solution_vars.volume.values;
			const yMax = machine.solution_vars.volume.max;
			const yMin = machine.solution_vars.volume.min;

			if (!this.svg[i]) this.svg[i] = d3.select(this.nodes[i]).append("svg");
			this.svg[i].attr("width", width).attr("height", height);

			this.x[i].domain([xMin, xMax]);
			this.x[i].range([0, width]);
			this.y[i].range([0, height]);

			this.svg[i].selectAll(".bar").remove();

			this.svg[i].selectAll(".bar")
				.data(this._getFilteredData(chartData))
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", (d) => this.x[i](d.time))
				.attr("width", 10)
				.attr("y", d => this.y[i](d.value))
				.attr("height", (d) => height - this.y[i](d.value));
		});
	}

	_getFilteredData (chartData) {
		const {xMin, xMax} = this.state;
		const filtered = [];
		for (let i = 0, l = chartData.length; i < l; i++) {
			const time = chartData[i].time.getTime();
			if (time < xMin.getTime()) continue;
			filtered.push(chartData[i]);
			if (time > xMax.getTime()) break;
		}
		return filtered;
	}

	_setupScales () {
		const {data} = this.props;
		const {xMin, xMax} = this.state;

		return Object.keys(data.machines).map((i) => {
			const machine = data.machines[i];
			const chartData = machine.solution_vars.volume.values;
			const yMax = machine.solution_vars.volume.max;
			const yMin = machine.solution_vars.volume.min;

			this.x[i] = d3.scaleTime();
			this.y[i] = d3.scaleLinear().domain([yMin, yMax]);
		});
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