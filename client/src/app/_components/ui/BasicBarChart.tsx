import React from 'react';
import { BarChart, XAxis, YAxis, Bar, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const BasicBarChart = () => {
	const data = [
		{
			name: 'Jan',
			moneys: 45000,
		},
		{
			name: 'Feb',
			moneys: 40000,
		},
		{
			name: 'Mar',
			moneys: 30000,
		},
		{
			name: 'Apr',
			moneys: 12500,
		},
		{
			name: 'May',
			moneys: 7500,
		},
	];

	// Formatter function
	const formatCurrency = (value) => {
		return `$${(value / 1000).toFixed(0)}K`;
	};

	return (
		<ResponsiveContainer width="100%" height={250}>
			<BarChart data={data} barSize={20}>
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
					domain={[0, 50000]}
					ticks={[0, 10000, 20000, 30000, 40000, 50000]}
				/>
				<CartesianGrid vertical={false} stroke="#666666" />
				<Tooltip formatter={(value) => formatCurrency(value)} />
				<Bar dataKey="moneys" fill="url(#colorHigh)" radius={2} />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BasicBarChart;
