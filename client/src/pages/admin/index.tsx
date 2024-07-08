import BasicButton from '@/app/_components/ui/BasicButton';
import Spinner from '@/app/_components/ui/Spinner';
import TextInput from '@/app/_components/ui/TextInput';
import PlatformLayout from '@/layouts/platform';
import { useMinaProvider } from '@/providers/minaprovider';
import { useState } from 'react';

export default function Admin() {
	const [pubKey, setPubKey] = useState('');

	const { deployToken, mintTokenTo, isMinaLoading } = useMinaProvider();

	return (
		<div className="flex flex-col w-full">
			<div className="m-2">
				<BasicButton
					disabled={isMinaLoading}
					onClick={async () => {
						await deployToken();
					}}
					type={'primary'}
				>
					Deploy Token{' '}
					{isMinaLoading ? (
						<div className="p-2">
							<Spinner size="sm" />
						</div>
					) : null}
				</BasicButton>
			</div>
			<div className=" flex m-2">
				<TextInput
					id={'pub-key'}
					name={'pub-key'}
					type={'text'}
					value={pubKey}
					onChange={(e) => setPubKey(e.target.value)}
				/>
				<BasicButton
					disabled={isMinaLoading}
					onClick={async () => {
						await mintTokenTo(pubKey);
					}}
					type={'primary'}
				>
					Mint Token to{' '}
					{isMinaLoading ? (
						<div className="p-2">
							<Spinner size="sm" />
						</div>
					) : null}
				</BasicButton>
			</div>
		</div>
	);
}

Admin.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
