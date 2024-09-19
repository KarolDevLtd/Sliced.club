import React, { useEffect, useState } from 'react';
import { BarChart, XAxis, YAxis, Bar, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type ChartDataItem = {
	name: string;
	moneys: number; // assuming 'moneys' is a number
};

type BasicBarChartProps = {
	chartData: ChartDataItem[];
};

const BasicBarChart = ({ chartData }: BasicBarChartProps) => {
	const [highestPrice, setHighestPrice] = useState(0);
	const [lowestPrice, setLowestPrice] = useState(0);

	// Formatter function
	const formatCurrency = (value: number) => {
		return `$${(value / 1000).toFixed(0)}K`;
	};

	//Not used atm but nice to have incase
	const getHighLowValues = () => {
		if (chartData.length > 0) {
			let highestPricedItem = chartData[0];
			let lowestPricedItem = chartData[0];

			for (const item of chartData) {
				if (item.moneys > highestPricedItem.moneys) {
					highestPricedItem = item;
				}
				if (item.moneys < lowestPricedItem.moneys) {
					lowestPricedItem = item;
				}
			}

			setHighestPrice(highestPricedItem.moneys);
			setLowestPrice(lowestPricedItem.moneys);
		}
	};

	useEffect(() => {
		getHighLowValues();
	}, [chartData]);

	return (
		<ResponsiveContainer width="100%" height={250}>
			<BarChart data={chartData} barSize={20}>
				<defs>
					<linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#71c36c" stopOpacity={1} />
						<stop offset="100%" stopColor="#71c36c" stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis dataKey="name" fontSize={12} axisLine={false} />
				<YAxis
					fontSize={12}
					axisLine={false}
					tickFormatter={formatCurrency}
					tickCount={5}
					domain={['auto', 'auto']}
				/>
				<CartesianGrid vertical={false} stroke="#666666" />
				<Tooltip formatter={(value: number) => formatCurrency(value)} />
				<Bar dataKey="moneys" fill="url(#colorHigh)" radius={2} />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BasicBarChart;
