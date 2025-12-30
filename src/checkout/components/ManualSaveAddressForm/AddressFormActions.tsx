import { Button } from "@/checkout/components/Button";
import { IconButton } from "@/checkout/components/IconButton";
import { TrashIcon } from "@/checkout/ui-kit/icons";

interface AddressFormActionsProps {
	onDelete?: () => void;
	onCancel: () => void;
	onSubmit: () => void;
	loading: boolean;
}

export const AddressFormActions: React.FC<AddressFormActionsProps> = ({
	onSubmit,
	onDelete,
	onCancel,
	loading,
}) => {
	return (
		<div className="flex flex-row justify-end gap-2">
			{onDelete && (
				<div className="flex">
					<IconButton ariaLabel="Supprimer l'adresse" onClick={onDelete} icon={<TrashIcon aria-hidden />} />
				</div>
			)}

			<Button ariaLabel="Annuler les modifications" variant="secondary" onClick={onCancel} label="Annuler" />
			{loading ? (
				<Button
					ariaDisabled
					ariaLabel="Enregistrement de l'adresse"
					onClick={(e) => e.preventDefault()}
					label="Traitement…"
				/>
			) : (
				<Button ariaLabel="Enregistrer l'adresse" onClick={onSubmit} label="Enregistrer l'adresse" />
			)}
		</div>
	);
};
