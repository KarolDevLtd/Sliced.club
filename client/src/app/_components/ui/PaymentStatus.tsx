type PaymentStatusProps = {
	status: string;
};

const PaymentStatus = ({ status }: PaymentStatusProps) => {
	if (status == 'paid') {
		return <strong className="border border-verygreen rounded-3xl px-5 text-verygreen">Paid</strong>;
	} else if (status == 'processing') {
		return <strong className="border border-bellow rounded-3xl px-5 text-bellow">Payment Processing</strong>;
	} else {
		return <strong className="border border-bigred rounded-3xl px-5 text-bigred">Error</strong>;
	}
};

export default PaymentStatus;
