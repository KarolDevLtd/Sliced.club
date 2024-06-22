import TextInput from '../ui/TextInput';
import BasicModal from '../ui/BasicModal';
import { useForm } from 'react-hook-form';
import BasicButton from '../ui/BasicButton';
import { closeModal } from '@/helpers/modal-helper';

const AdmitUserModal = () => {
	const {
		register,
		unregister,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		// Resolver for using Zod validation library schema
		// https://react-hook-form.com/docs/useform#resolver
		// resolver: {}
	});

	const onSubmit = async (data: any) => {
		try {
			console.log(data['user-key']);
		} catch (err) {
			console.log(err);
		} finally {
			// setIsLoading(false);
			// onGroupSubmitted();
		}
	};

	const handleOnClose = () => {
		clearForm();
		closeModal('admit-user');
	};

	const clearForm = () => {
		reset();
		unregister(['user-key']);
	};

	return (
		<BasicModal
			id="admit-user"
			header="Admit User"
			onClose={handleOnClose}
			content={
				<form onSubmit={handleSubmit(onSubmit)}>
					<TextInput
						id="user-key"
						// icon={<FaUserGroup />}
						name="user-key"
						type="text"
						label="User Key"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'User key must be provided',
							minLength: {
								value: 10,
								message: 'User key must be at least 10 characters',
							},
						}}
					/>
					<BasicButton
						type="primary"
						// icon={isLoading ? <Spinner size="sm" /> : null}
						// disabled={isLoading}
						submitForm={true}
					>
						Admit
					</BasicButton>
				</form>
			}
		></BasicModal>
	);
};

export default AdmitUserModal;
