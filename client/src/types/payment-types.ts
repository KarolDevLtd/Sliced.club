import { type Product } from './product-types';

export type Payment = {
	amountDue: number;
	nextPaymentDue: Date;
	product: Product;
};
