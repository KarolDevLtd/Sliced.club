export type Payment = {
	amountDue: number;
	nextPaymentDue: string; // that should be date of that payment
	// product: Product;
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
