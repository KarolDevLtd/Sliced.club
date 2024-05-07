/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from 'react';
import { TextInput } from '../ui/TextInput';
import { BsFillTrashFill } from 'react-icons/bs';
import { BasicButton } from '../ui/BasicButton';
import { toast } from 'react-toastify';

type ProductFieldsProps = {
	// productOpen: boolean;
	onClose: () => void;
	attributes: [];
	setAttributes: (value) => void;
};

const ProductFields = ({ onClose, attributes, setAttributes }: ProductFieldsProps) => {
	// const [rows, setRows] = useState([]);

	const handleAddRow = () => {
		if (attributes.length < 6) {
			setAttributes([...attributes, { propertyName: '', propertyValue: '' }]);
		} else {
			toast.warn('Cannot have more than 6 attributes');
		}
	};

	const handleChange = (index, key, value) => {
		const updatedRows = [...attributes];
		updatedRows[index][key] = value;
		setAttributes(updatedRows);
	};

	const handleDeleteRow = (propertyName) => {
		setAttributes((prevRows) => prevRows.filter((row) => row.propertyName !== propertyName));
	};

	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>Property Name</th>
						<th>Property Value</th>
					</tr>
				</thead>
				<tbody>
					{attributes.map((row, index) => (
						<tr key={index}>
							<td>
								<TextInput
									type="text"
									value={row.propertyName}
									onChange={(e) => handleChange(index, 'propertyName', e.target.value)}
								/>
							</td>
							<td>
								<TextInput
									type="text"
									value={row.propertyValue}
									onChange={(e) => handleChange(index, 'propertyValue', e.target.value)}
								/>
							</td>
							<td>
								<BsFillTrashFill onClick={() => handleDeleteRow(row.propertyName)}>
									Delete
								</BsFillTrashFill>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex">
				<BasicButton onClick={handleAddRow} type={'secondary'}>
					Add Row
				</BasicButton>
				<BasicButton onClick={onClose} type={'secondary'}>
					Close
				</BasicButton>
			</div>
		</div>
	);
};
export default ProductFields;
