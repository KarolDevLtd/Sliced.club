import { type DropDownContentModel } from './dropdown-content-model';

interface CurrencyOptions extends DropDownContentModel {
	symbol?: string;
}

export const CurrencyOptions: CurrencyOptions[] = [
	{
		value: 'USD',
		symbol: '$',
		name: 'United States',
	},
	{
		value: 'EUR',
		symbol: '€',
		name: 'Eurozone',
	},
	// South American Currencies
	{
		value: 'BRL',
		symbol: 'R$',
		name: 'Brazil',
	},
	{
		value: 'ARS',
		symbol: 'ARS$',
		name: 'Argentina',
	},
	{
		value: 'CLP',
		symbol: 'CLP$',
		name: 'Chile',
	},
	{
		value: 'COP',
		symbol: 'COP$',
		name: 'Colombia',
	},
	{
		value: 'PEN',
		symbol: 'S/',
		name: 'Peru',
	},
	{
		value: 'UYU',
		symbol: '$U',
		name: 'Uruguay',
	},
	// Other Common Currencies
	{
		value: 'GBP',
		symbol: '£',
		name: 'United Kingdom',
	},
	{
		value: 'JPY',
		symbol: '¥',
		name: 'Japan',
	},
	{
		value: 'AUD',
		symbol: 'A$',
		name: 'Australia',
	},
	{
		value: 'CAD',
		symbol: 'C$',
		name: 'Canada',
	},
	{
		value: 'CHF',
		symbol: 'Fr',
		name: 'Switzerland',
	},
	{
		value: 'CNY',
		symbol: 'CN¥',
		name: 'China',
	},
	{
		value: 'SEK',
		symbol: 'kr',
		name: 'Sweden',
	},
	{
		value: 'NZD',
		symbol: 'NZ$',
		name: 'New Zealand',
	},
];
