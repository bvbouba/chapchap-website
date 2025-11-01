import NextImage, { type ImageProps } from "next/image";

export const ProductImageWrapper = (props: ImageProps & { className?: string }) => {
	return (
		<div className={`overflow-hidden bg-neutral-50 ${props.className}`}>
			<NextImage {...props} className="h-full w-full object-contain object-center" />
		</div>
	);
};
