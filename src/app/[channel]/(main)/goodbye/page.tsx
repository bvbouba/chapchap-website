"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoodbyePage() {
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace("/");
		}, 5000);
		return () => clearTimeout(timer);
	}, [router]);

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
			<div className="max-w-lg rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
				<h1 className="mb-4 text-2xl font-bold text-[#EB1700]">Au revoir</h1>
				<p className="mb-4 text-neutral-700">
					Votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir.
				</p>
				<p className="mb-6 text-sm text-neutral-500">
					Vous serez redirigé vers la page d&apos;accueil dans quelques secondes.
				</p>
				<button
					type="button"
					onClick={() => router.replace("/")}
					className="rounded bg-[#A6C65A] px-4 py-2.5 font-semibold text-white hover:bg-[#95b54f]"
				>
					Retour à l&apos;accueil
				</button>
			</div>
		</div>
	);
}
