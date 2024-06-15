import { type Product } from './product-types';

export type Payment = {
	amountDue: number;
	nextPaymentDue: Date;
	product: Product;
	transactionId: string;
	status: string;
};

export type LastPayment = {
	id: number;
	userId: string;
	paymentDue: Date;
	type: string;
	status: string;
};

export type Bid = {
	id: number;
	date: Date;
	amount: number;
};
