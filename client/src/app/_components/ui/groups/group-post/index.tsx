/* eslint-disable react/no-children-prop */
import React, { useState } from 'react';
import { TextInput } from '../../text-input';
import { TextArea } from '../../text-area';
import { BasicButton } from '../../basic-button';
import { BasicModal } from '../../basic-modal';

const GroupPost = () => {
	const [postOpen, setPostOpen] = useState(false);

	const hidePostInput = () => {
		setPostOpen(false);
	};

	const showPostInput = () => {
		setPostOpen(true);
	};

	return (
		<div className="flex flex-col bg-red-500 w-1/3">
			<BasicButton children={'Add Post'} type={'primary'} onClick={showPostInput}></BasicButton>
			<BasicModal
				isOpen={postOpen}
				onClose={hidePostInput}
				header={<h2 className="text-xl font-semibold">Add Post</h2>}
				content={
					<div>
						<TextInput label={''} placeholder={'TITLE OF POST'} />
						<TextArea label={''} placeholder={'TYPE HERE M8'} rows={5} />
					</div>
				}
				footer={
					<div>
						<button className="bg-blue-500 text-red px-4 py-2 rounded-md hover:bg-blue-600 mr-4">
							Save
						</button>
						<button
							className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
							onClick={hidePostInput}
						>
							Cancel
						</button>
					</div>
				}
			/>
		</div>
	);
};

export default GroupPost;
