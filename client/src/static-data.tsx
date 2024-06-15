import { Bid, LastPayment, type Payment } from './types/payment-types';

export const myPayments = [
	{
		amountDue: 18.27,
		nextPaymentDue: new Date('2024-04-30'),
		product: {
			title: 'Xbox Series X|S',
			groupOrganiser: 'Microsoft',
			price: 475,
			category: 'Gaming Consoles',
			groupMembers: 26,
			itemsReceived: 14,
		},
	},
	{
		amountDue: 10.48,
		nextPaymentDue: new Date('2024-04-30'),
		product: {
			title: 'HERO 12 Black',
			groupOrganiser: 'GoPro',
			price: 429.99,
			category: 'Cameras',
			groupMembers: 41,
			itemsReceived: 36,
		},
	},
] as Payment[];

export const productPayments = [
	{
		id: 1,
		nextPaymentDue: new Date('2024-04-30'),
		amountDue: 18.27,
		transactionId: 'Transaction1',
		status: 'paid',
	},
	{
		id: 2,
		nextPaymentDue: new Date('2024-05-03'),
		amountDue: 20.27,
		transactionId: 'Transaction2',
		status: 'paid',
	},
	{
		id: 3,
		nextPaymentDue: new Date('2024-05-06'),
		amountDue: 19.99,
		transactionId: 'Transaction3',
		status: 'processing',
	},
	{
		id: 4,
		nextPaymentDue: new Date('2024-05-09'),
		amountDue: 25.97,
		transactionId: 'Transaction4',
		status: 'sad',
	},
];

export const lastPayments = [
	{
		id: 1,
		userId: 'B62qnj5qPLFN5fWwcpFpBdKN3dScpSaWmoXWZKvn78ZWjBjdeyzQeDi',
		paymentDue: new Date('2024-04-30'),
		type: 'Lottery',
		status: 'Status',
	},
	{
		id: 2,
		userId: 'B62qkqjycNFHVhR57qTAQq1UW1TLNX75J6XEQjN1mGgQtVkJnkaW3YC',
		paymentDue: new Date('2024-05-03'),
		type: 'Lottery',
		status: 'Status',
	},
	{
		id: 3,
		userId: 'B62qoXi7mNK7iWkRKYqRTCKqVUvfajQZmWdHbyNt7MjXTzNfzPPzBM6',
		paymentDue: new Date('2024-05-06'),
		type: 'Auction',
		status: 'Status',
	},
	{
		id: 4,
		userId: 'B62qmojEjJ8GaJ2a1xVrAEzPaaBV6VKmbKvyyqDfkTuU8eLptpcifSN',
		paymentDue: new Date('2024-05-09'),
		type: 'Lottery',
		status: 'Status',
	},
] as LastPayment[];

export const bids = [
	{
		id: 1,
		date: new Date('2024-04-30'),
		amount: 480,
	},
	{
		id: 2,
		date: new Date('2024-05-03'),
		amount: 680,
	},
	{
		id: 3,
		date: new Date('2024-05-09'),
		amount: 460,
	},
] as Bid[];

export const PaymentBarChartData = [
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

export const OfferDetailBarChartData = [
	{
		name: 'Jan',
		moneys: 25000,
	},
	{
		name: 'Feb',
		moneys: 30000,
	},
	{
		name: 'Mar',
		moneys: 40000,
	},
	{
		name: 'Apr',
		moneys: 45000,
	},
	{
		name: 'May',
		moneys: 80000,
	},
	{
		name: 'June',
		moneys: 90000,
	},
	{
		name: 'July',
		moneys: 100000,
	},
	{
		name: 'Aug',
		moneys: 155000,
	},
	{
		name: 'Sept',
		moneys: 165000,
	},
	{
		name: 'Oct',
		moneys: 180000,
	},
	{
		name: 'Nov',
		moneys: 290000,
	},
	{
		name: 'Dec',
		moneys: 305000,
	},
];
