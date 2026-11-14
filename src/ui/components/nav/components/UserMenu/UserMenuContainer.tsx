import { UserIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { CurrentUserDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";

export async function UserMenuContainer() {
    const { me: user } = await executeGraphQL(CurrentUserDocument, {
        cache: "no-cache",
    });

    if (user) {
        return <UserMenu user={user} />;
    } else {
        return (
            <div className="flex items-center gap-2">
                <LinkWithChannel
                    href="/account/login"
                    className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#303030] transition hover:bg-[#F5F5F5]"
                >
                    <UserIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="hidden lg:inline">Se connecter</span>
                </LinkWithChannel>
                <LinkWithChannel
                    href="/account/signup"
                    className="hidden h-10 items-center rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white transition hover:bg-[#C91400] sm:inline-flex"
                >
                    S&apos;inscrire
                </LinkWithChannel>
            </div>
        );
    }
}