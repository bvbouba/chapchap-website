import { SignInFormContainer, type SignInFormContainerProps } from "../Contact/SignInFormContainer";
import { TextInput } from "@/checkout/components/TextInput";
import { useGuestUserForm } from "@/checkout/sections/GuestUser/useGuestUserForm";
import { FormProvider } from "@/checkout/hooks/useForm/FormProvider";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type GuestUserProps = Pick<SignInFormContainerProps, "onSectionChange"> & {
	onEmailChange: (email: string) => void;
	email: string;
	onContinueToPayment?: () => void;
};

export const GuestUser: React.FC<GuestUserProps> = ({
	onSectionChange,
	onEmailChange,
	email: initialEmail,
	onContinueToPayment,
}) => {
	const form = useGuestUserForm({ initialEmail, onContinueToPayment });
	const { handleChange, values } = form;
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [termsOpen, setTermsOpen] = useState(false);

	return (
		<SignInFormContainer
			title="Déjà venu ?"
			redirectSubtitle="Connectez-vous pour réserver plus rapidement"
			redirectButtonLabel="SE CONNECTER À MON COMPTE"
			onSectionChange={onSectionChange}
		>
			<FormProvider form={form}>
				{/* Informations de contact */}
				<section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<h3 className="mb-4 text-lg font-semibold text-gray-800">Informations de contact</h3>

					<div className="grid grid-cols-1 gap-4">
						<TextInput
							required
							name="phone"
							label="Numéro de téléphone"
							placeholder="Entrez votre numéro de téléphone"
							onChange={handleChange}
						/>

						<TextInput
							name="email"
							label="Adresse e-mail"
							placeholder="Entrez votre adresse e-mail"
							onChange={(event) => {
								handleChange(event);
								onEmailChange(event.currentTarget.value);
							}}
						/>
					</div>
				</section>

				{/* Informations du passager */}
				<section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<h3 className="mb-2 text-lg font-semibold text-gray-800">Détails du passager</h3>
					<p className="mb-5 text-sm text-gray-600">
						Les noms des passagers doivent correspondre à ceux figurant sur leur pièce d’identité.
					</p>

					{values.passengers.map((p, i) => (
						<div key={i} className="mb-6 space-y-3 border-b pb-4">
							<h4 className="text-base font-medium text-gray-700">Passager {i + 1}</h4>

							<TextInput
								required
								name={`passengers[${i}].lastName`}
								label="Nom de famille"
								placeholder="Entrez le nom de famille"
								onChange={handleChange}
							/>

							<TextInput
								required
								name={`passengers[${i}].firstName`}
								label="Prénom"
								placeholder="Entrez le prénom"
								onChange={handleChange}
							/>
						</div>
					))}
				</section>

				{/* Conditions générales collapsible */}
				<section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<h3 className="mb-3 text-lg font-semibold text-gray-800">Conditions générales</h3>

					<p className="mb-4 text-sm text-gray-600">
						Je reconnais avoir lu et accepté toutes les conditions ci-dessous.
					</p>

					<div className="mb-4">
						<button
							type="button"
							className="flex w-full items-center justify-between text-left font-medium text-red-600"
							onClick={() => setTermsOpen(!termsOpen)}
						>
							<span>Conditions générales de ChapChap Tickets</span>
							{termsOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
						</button>

						{termsOpen && (
							<div className="mt-3 text-sm leading-relaxed text-gray-700">
								Toutes les réservations effectuées via ChapChap Tickets sont soumises aux conditions générales
								de vente établies par la plateforme. Les billets achetés sont{" "}
								<strong>non remboursables</strong> et <strong>non échangeables</strong>, sauf indication
								contraire de la part du transporteur.
								<br />
								ChapChap Tickets agit comme une plateforme de réservation et ne peut être tenue responsable
								des modifications, retards ou annulations effectués par le transporteur.
							</div>
						)}
					</div>

					<div className="mb-4 flex items-center space-x-2">
						<input
							id="acceptTerms"
							type="checkbox"
							checked={acceptedTerms}
							onChange={(e) => setAcceptedTerms(e.target.checked)}
							className="text-[#97D700]] h-4 w-4 rounded border-green-300 focus:ring-blue-500"
						/>
						<label htmlFor="acceptTerms" className="text-sm text-gray-700">
							J’accepte les conditions générales de ChapChap Tickets.
						</label>
					</div>

					<button
						type="button"
						onClick={async () => {
							if (!acceptedTerms) {
								alert("Veuillez accepter les conditions générales avant de continuer.");
								return;
							}

							try {
								// If email is empty, set a default value
								if (!form.values.email || form.values.email.trim() === "") {
									form.setFieldValue("email", "anonymous@chapchaptickets.com");
									onEmailChange("anonymous@chapchaptickets.com");
								}
								form.handleSubmit();
							} catch (error) {
								console.error("Erreur lors de la soumission du formulaire :", error);
								alert("Veuillez vérifier les informations du formulaire avant de continuer.");
							}
						}}
						className={`mt-3 flex w-full items-center justify-center rounded-lg py-3 font-semibold text-white transition ${
							acceptedTerms && !form.isSubmitting
								? "bg-secondary hover:bg-secondary-dark"
								: "cursor-not-allowed bg-gray-400"
						}`}
						disabled={!acceptedTerms || form.isSubmitting}
					>
						{form.isSubmitting ? (
							<div className="flex items-center space-x-2">
								<span>Continuer vers le paiement</span>
								<div className="flex space-x-1">
									<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
									<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
									<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
								</div>
							</div>
						) : (
							<span>Continuer vers le paiement</span>
						)}
					</button>
				</section>
			</FormProvider>
		</SignInFormContainer>
	);
};
