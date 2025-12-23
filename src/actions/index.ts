"use server";

import { revalidatePath } from "next/cache";
import { executeGraphQL } from "@/lib/graphql";
import { AddressInput, CheckoutBillingAddressUpdateDocument, CheckoutCustomerNoteUpdateDocument, CheckoutDeleteLinesDocument, CheckoutEmailUpdateDocument, CheckoutLineUpdateDocument, CheckoutLineUpdateInput, GetAttributeBySlugDocument, OrderDirection, PasswordResetRequestOtpDocument, PasswordResetVerificationOtpDocument, PasswordSettingDocument, ProductVariantCollectionDocument, ProductVariantSortField, ProductVariantWhereInput, SendCodeDocument, UserRegisterDocument, VerifyCodeDocument } from "@/gql/graphql";
import { CombinedError } from "urql";
import { mapEdgesToItems } from "@/lib/maps";
import { getServerAuthClient } from "@/app/config";


export async function getAllCities() {
  try {
    const {attribute:attribute1} = await executeGraphQL(GetAttributeBySlugDocument, {
		variables: 
		{ slug:"departure-city" },
	  });

	const departureCities = mapEdgesToItems(attribute1?.choices)


	const {attribute:attribute2} = await executeGraphQL(GetAttributeBySlugDocument, {
		variables: { slug:"arrival-city" },
	  });

	  const arrivalCities = mapEdgesToItems(attribute2?.choices)
    return {
      departureCities,
      arrivalCities,
    };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { departureCities: [], arrivalCities: [] };
  }
}

type searchCitiesArgs = {
	type: string;
};

export const searchCities = async ({ type }: searchCitiesArgs) => {
	const slug = type === "departure" ? "departure-city" : "arrival-city";

  const {attribute} = await executeGraphQL(GetAttributeBySlugDocument, {
    variables: { slug },
  });

  const choices = mapEdgesToItems(attribute?.choices)

	return {
		results: choices
	}
};


type collectionProductsArgs = {
	where?: ProductVariantWhereInput;
	sortBy?: {
	  field: ProductVariantSortField;
	  direction?: OrderDirection;
	};
	perPage?: number;
	after?: string | null;
	channel:string
};

export const collectionProducts = async ({ where,sortBy,perPage,after,channel }: collectionProductsArgs) => {
  
	const {productVariants} = await executeGraphQL(ProductVariantCollectionDocument, {
		variables: {
		  where,
		  first: perPage,
		  after,
		  channel,
		  ...(sortBy?.field &&
			sortBy?.direction && {
			  sortBy: {
				field: sortBy.field,
				direction: sortBy.direction,
			  },
			}),
		},
	  });

	return {
		results: {productVariants}
	}
};





type deleteLineFromCheckoutArgs = {
	lineId: string;
	checkoutId: string;
};

export const deleteLineFromCheckout = async ({ lineId, checkoutId }: deleteLineFromCheckoutArgs) => {
	await executeGraphQL(CheckoutDeleteLinesDocument, {
		variables: {
			checkoutId,
			lineIds: [lineId],
		},
		cache: "no-cache",
	});

	revalidatePath("/cart");
};

type updateLineFromCheckoutArgs = {
	lines: Array<CheckoutLineUpdateInput> | CheckoutLineUpdateInput;
	checkoutId: string;
};

export const updateLineFromCheckout = async ({ lines, checkoutId }: updateLineFromCheckoutArgs) => {
	const { checkoutLinesUpdate } = await executeGraphQL(CheckoutLineUpdateDocument, {
		variables: {
			checkoutId,
			lines,
		},
		cache: "no-cache",
	});

	revalidatePath("/cart");
	return {
		checkout: checkoutLinesUpdate?.checkout,
		errors: checkoutLinesUpdate?.errors
	}
};

type UpdateCheckoutContactInfoArgs = {
	email: string;
	checkoutId: string;
	address: AddressInput;
	customerNote:string;
  };
  
  /**
   * Unified checkout contact updater that matches urql's { data, error } shape.
   */
  export const updateCheckoutContactInfo = async ({
	email,
	checkoutId,
	address,
	customerNote
  }: UpdateCheckoutContactInfoArgs) => {
	try {
	  // Step 1: Update checkout email
	  const { checkoutEmailUpdate } = await executeGraphQL(CheckoutEmailUpdateDocument, {
		variables: { email, checkoutId },
		cache: "no-cache",
	  });
  
	  // Step 2: Update billing address
	  const { checkoutBillingAddressUpdate } = await executeGraphQL(
		CheckoutBillingAddressUpdateDocument,
		{
		  variables: { address, checkoutId },
		  cache: "no-cache",
		},
	  );

	   // Step 2: Update billing address
	   const { checkoutCustomerNoteUpdate } = await executeGraphQL(
		CheckoutCustomerNoteUpdateDocument,
		{
		  variables: { customerNote, checkoutId },
		  cache: "no-cache",
		},
	  );
  
	  // Merge results
	  const checkout =
		checkoutBillingAddressUpdate?.checkout || checkoutEmailUpdate?.checkout || checkoutCustomerNoteUpdate?.checkout;
  
	  const errors = [
		...(checkoutEmailUpdate?.errors || []),
		...(checkoutBillingAddressUpdate?.errors || []),
		...(checkoutCustomerNoteUpdate?.errors || []),
	  ];
  
	  // ✅ Return in urql-compatible shape
	  return {
		data: {
		  checkoutContactUpdate: {
			checkout,
			errors,
		  },
		},
		error: undefined, // ✅ must be undefined, not null
	  };
	} catch (err: any) {
	  // ✅ Convert unknown errors to CombinedError
	  const combinedError =
		err instanceof CombinedError ? err : new CombinedError({ networkError: err });
  
	  return {
		data: undefined,
		error: combinedError,
	  };
	}
  };


  type requestOTPArgs = {
	phoneNumber: string;
};

export const requestOTP = async ({ phoneNumber }: requestOTPArgs) => {
	const {sendOtp} = await executeGraphQL(SendCodeDocument, {
		variables: {
			phoneNumber,
		},
		cache: "no-cache",
	});
   return {
	message:sendOtp?.message,
	error:sendOtp?.error
   }
};

type verifyCodeArgs = {
	phoneNumber: string;
	otp:string,
};


export const verifyCode = async ({ phoneNumber,otp }: verifyCodeArgs) => {
	const {verifyOtp} = await executeGraphQL(VerifyCodeDocument, {
		variables: {
			phoneNumber,
			otp
		},
		cache: "no-cache",
	});
   return {
	message:verifyOtp?.message,
	error:verifyOtp?.error
   }
};



type registerUserArgs = {
	email: string;
	password:string,
	firstName:string,
	lastName:string,
};


export const registerUser = async ({ email, password, firstName,lastName}: registerUserArgs) => {
	const {accountRegister} = await executeGraphQL(UserRegisterDocument, {
		variables: {
			input:{
				email,
				firstName,
				password,
				lastName
			}
		},
		cache: "no-cache",
	});
   return {
	error:accountRegister?.errors
   }
};


export async function loginSubmit(email: string, password: string) {
    const { data } = await (await getServerAuthClient()).signIn(
        { email, password },
        { cache: "no-store" }
    );
    
    return { 
        errors: data.tokenCreate?.errors || [],
        success: data.tokenCreate?.errors?.length === 0 
    };
}

type requestPasswordResetArgs = {
	phoneNumber: string
};


export async function requestPasswordReset({phoneNumber}: requestPasswordResetArgs) {
	const {requestPasswordResetOtp} = await executeGraphQL(PasswordResetRequestOtpDocument, {
		variables: {
			phoneNumber,
		},
		cache: "no-cache",
	});
   return {
	error:requestPasswordResetOtp?.errors
   }
    
}

type verifyPasswordResetArgs = {
	phoneNumber: string, 
	code: string
};

export async function verifyPasswordReset({phoneNumber,code}:verifyPasswordResetArgs) {
	const {verifyPasswordResetOtp} = await executeGraphQL(PasswordResetVerificationOtpDocument, {
		variables: {
			phoneNumber,
		    code
		},
		cache: "no-cache",
	});
   return {
	error:verifyPasswordResetOtp?.errors,
	token:verifyPasswordResetOtp?.token
   }
    
}

type finalizePasswordResetArgs = {
	email: string, 
	token: string, 
	password: string
};

export async function finalizePasswordReset({email,token,password}:finalizePasswordResetArgs) {
    const {setPassword} = await executeGraphQL(PasswordSettingDocument, {
		variables: {
			password,
		    token,
			email
		},
		cache: "no-cache",
	});
   return {
	error:setPassword?.errors,
	token:setPassword?.token
   }
}