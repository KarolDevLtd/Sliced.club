import PageHeader from '~/app/_components/ui/PageHeader';
import { useState } from 'react';
import AddProductModal from '~/app/_components/products/AddProductModal';
import BasicButton from '~/app/_components/ui/BasicButton';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';
import PlatformLayout from '~/layouts/platform';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import ProductList from '~/app/_components/products/ProductList';

export default function Products() {
	const [productOpen, setProductOpen] = useState(false);
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const showProduct = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a product')) return;
		setProductOpen(true);
	};

	const hideProduct = () => {
		setProductOpen(false);
	};

	return (
		<>
			<PageHeader text="My Products" subtext="Check the details of your products" />
			<div className="p-1">
				<BasicButton type="primary" onClick={showProduct}>
					Add Product
				</BasicButton>
				<ProductList />
			</div>
			<AddProductModal productOpen={productOpen} hideProduct={hideProduct} />
		</>
	);
}

Products.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
