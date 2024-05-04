import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function Categories() {
	return (
		<div>
			<PageHeader text="Categories" />
		</div>
	);
}

Categories.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
