import BasicButton from '@/app/_components/ui/BasicButton';
import TextInput from '@/app/_components/ui/TextInput';
import PlatformLayout from '@/layouts/platform';
import { useMinaProvider } from '@/providers/minaprovider';
import { useState } from 'react';

export default function Admin() {
	const [pubKey, setPubKey] = useState('');

	const { deployToken, mintTokenTo } = useMinaProvider();

	return (
		<div className="flex flex-col w-full">
			<div className="m-2">
				<BasicButton
					onClick={async () => {
						await deployToken();
					}}
					type={'primary'}
				>
					Deploy Token
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
					onClick={async () => {
						await mintTokenTo(pubKey);
					}}
					type={'primary'}
				>
					Mint Token to
				</BasicButton>
			</div>
		</div>
	);
}

Admin.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
