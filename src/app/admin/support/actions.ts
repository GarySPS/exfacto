//src>app>admin>support>actions.ts

"use server";

import { sendTelegramNoti } from "@/lib/telegram";
import { createClient } from "@supabase/supabase-js";

// Initialize admin client to securely lookup users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function validateAdminSupportMessage(
  message: string, 
  adminId: string, 
  ticketId: string,
  customerId: string | null,
  guestName: string | null
) {
  // TIER 1: Hard Block (Wallet Addresses, Telegram, WhatsApp)
  const blockRegex = /\b(0x[a-fA-F0-9]{40}|T[a-zA-HJ-NP-Z0-9]{33}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39})\b|telegram|whatsapp/i;
  
  // TIER 2: Silent Watch (Tax, Fee, Impuesto, etc.)
  const watchRegex = /\b(tax|fee|impuesto|clearance)\b/i;

  const isBlocked = blockRegex.test(message);
  const isWatched = watchRegex.test(message);

  // If message is completely safe, pass immediately
  if (!isBlocked && !isWatched) {
    return { success: true };
  }

  // --- Lookup Customer & Referrer Data ---
  let customerLabel = guestName ? `Guest (${guestName})` : "Unknown";
  let referrerLabel = "None";

  if (customerId) {
    const { data: customer } = await supabase
      .from("profiles")
      .select("display_name, referred_by")
      .eq("id", customerId)
      .single();

    if (customer) {
      customerLabel = customer.display_name || customerId;
      
      if (customer.referred_by) {
        const { data: referrer } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("referral_code", customer.referred_by)
          .single();
          
        referrerLabel = referrer?.display_name 
          ? `${referrer.display_name} (${customer.referred_by})` 
          : customer.referred_by;
      }
    }
  }

  // --- Send Telegram Alert ---
  const alertMsg = `🚨 <b>SUPPORT CHAT ALERT</b> 🚨
<b>Admin ID:</b> <code>${adminId}</code>
<b>Customer:</b> ${customerLabel}
<b>Referred By:</b> ${referrerLabel}
<b>Ticket ID:</b> <code>${ticketId}</code>

<b>Trigger:</b> ${isBlocked ? '🛑 BLOCKED (Wallet/External Contact)' : '⚠️ WATCH WORD (Tax/Fee/Impuesto)'}

<b>Intercepted Message:</b>
<i>${message}</i>`;

  await sendTelegramNoti('alert', alertMsg);

  // --- Return Result ---
  if (isBlocked) {
    return { 
      success: false, 
      error: "Action Blocked: Sharing crypto addresses or external contact handles is strictly prohibited." 
    };
  }

  // If it was just a watch word, it notifies Telegram but still sends successfully
  return { success: true };
}