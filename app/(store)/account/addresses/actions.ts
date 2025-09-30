"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function getAddresses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }

  return addresses;
}

export async function addAddress(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const type = formData.get("type") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const postalCode = formData.get("postalCode") as string;
  const country = formData.get("country") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to add an address",
    };
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    type,
    first_name: firstName,
    last_name: lastName,
    address,
    city,
    postal_code: postalCode,
    country,
  });

  if (error) {
    return { success: false, message: "Could not add address" };
  }

  revalidatePath("/account/addresses");

  return { success: true, message: "Successfully added address" };
}
