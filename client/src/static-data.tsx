import { type Payment } from './types/payment-types';

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
		status: 'Paid',
	},
	{
		id: 2,
		nextPaymentDue: new Date('2024-05-03'),
		amountDue: 20.27,
		transactionId: 'Transaction2',
		status: 'Paid',
	},
	{
		id: 3,
		nextPaymentDue: new Date('2024-05-06'),
		amountDue: 19.99,
		transactionId: 'Transaction3',
		status: 'Paid',
	},
	{
		id: 4,
		nextPaymentDue: new Date('2024-05-09'),
		amountDue: 25.97,
		transactionId: 'Transaction4',
		status: 'Payment Processing',
	},
];
