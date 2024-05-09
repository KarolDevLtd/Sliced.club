/* eslint-disable @typescript-eslint/no-unsafe-call */
import PageHeader from '~/app/_components/ui/PageHeader';
import AddProductModal from '~/app/_components/products/AddProductModal';
import BasicButton from '~/app/_components/ui/BasicButton';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';
import PlatformLayout from '~/layouts/platform';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { showModal } from '~/helpers/modal-helper';

export default function Products() {
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const showProduct = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a product')) return;
		showModal('add-product');
	};

	return (
		<>
			<PageHeader text="My Products" subtext="Check the details of your products" />
			<div className="p-1">
				<BasicButton type="primary" onClick={showProduct}>
					Add Product
				</BasicButton>
			</div>
			<AddProductModal />
		</>
	);
}

Products.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
