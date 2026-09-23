//src/app/guest-support/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Headphones,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type GuestChatMessage = {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
};

const SESSION_KEY = "exfacto_guest_support_session";
const TICKET_KEY = "exfacto_guest_support_ticket";

function createGuestSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOrCreateGuestSessionId() {
  const existing = window.localStorage.getItem(SESSION_KEY);

  if (existing) {
    return existing;
  }

  const next = createGuestSessionId();
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export default function GuestSupportPage() {
  const [guestSessionId, setGuestSessionId] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [subject, setSubject] = useState("Login Support");
  const [message, setMessage] = useState("");

  const [chatMessages, setChatMessages] = useState<GuestChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");

  const [loadingThread, setLoadingThread] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const sessionId = getOrCreateGuestSessionId();
    const savedTicketId = window.localStorage.getItem(TICKET_KEY);

    setGuestSessionId(sessionId);

    if (savedTicketId) {
      setTicketId(savedTicketId);
      loadThread(sessionId, savedTicketId);
    }
  }, []);

  useEffect(() => {
    if (!guestSessionId || !ticketId) return;

    // Listen instantly for new messages on this specific ticket
    const channel = supabase
      .channel(`guest-support-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_chat_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          loadThread(guestSessionId, ticketId, true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestSessionId, ticketId]);

async function loadThread(
  activeSessionId = guestSessionId,
  activeTicketId = ticketId,
  silent = false
) {
  if (!activeSessionId || !activeTicketId) return;

  if (!silent) {
    setLoadingThread(true);
  }

  setErrorText("");

  const { data, error } = await supabase.rpc("get_guest_support_thread", {
    p_guest_session_id: activeSessionId,
    p_ticket_id: activeTicketId,
  });

  if (error) {
    setErrorText(error.message);

    if (!silent) {
      setLoadingThread(false);
    }

    return;
  }

  setChatMessages((data || []) as GuestChatMessage[]);

  if (!silent) {
    setLoadingThread(false);
  }
}

  async function handleCreateTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setSuccessText("");
    setErrorText("");

    const finalName = guestName.trim();
    const finalContact = guestContact.trim();
    const finalSubject = subject.trim() || "Login Support";
    const finalMessage = message.trim();
    const sessionId = guestSessionId || getOrCreateGuestSessionId();

    if (!finalName || !finalContact || !finalMessage) {
      setErrorText("Please enter your name, contact, and message.");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase.rpc("create_guest_support_ticket", {
      p_guest_session_id: sessionId,
      p_guest_name: finalName,
      p_guest_contact: finalContact,
      p_subject: finalSubject,
      p_message: finalMessage,
    });

    if (error) {
      setErrorText(error.message);
      setSubmitting(false);
      return;
    }

    const nextTicketId = String(data);

    window.localStorage.setItem(SESSION_KEY, sessionId);
    window.localStorage.setItem(TICKET_KEY, nextTicketId);

    setGuestSessionId(sessionId);
    setTicketId(nextTicketId);
    setMessage("");
    setSuccessText("Support request submitted.");

    await loadThread(sessionId, nextTicketId);

    setSubmitting(false);
  }

  async function handleSendReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!ticketId) return;

    const finalMessage = replyText.trim();

    if (!finalMessage) {
      setErrorText("Please write your message.");
      return;
    }

    setSubmitting(true);
    setErrorText("");
    setSuccessText("");

    const { error } = await supabase.rpc("send_guest_support_message", {
      p_guest_session_id: guestSessionId,
      p_ticket_id: ticketId,
      p_message: finalMessage,
    });

    if (error) {
      setErrorText(error.message);
      setSubmitting(false);
      return;
    }

    setReplyText("");
    setSuccessText("Message sent.");

    await loadThread();

    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col overflow-hidden border-x border-white/10 bg-[radial-gradient(circle_at_top,#3a2a08_0%,#0b0903_34%,#050505_72%,#000_100%)]">
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            href="/login"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-yellow-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
            Online
          </div>
        </div>

        <section className="flex flex-1 flex-col px-5 pb-8">
          <div className="mb-5 rounded-[2rem] border border-yellow-400/25 bg-white/[0.055] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-yellow-300/40 bg-gradient-to-br from-yellow-300/25 via-yellow-500/10 to-black shadow-[0_0_45px_rgba(234,179,8,0.28)]">
              <Headphones className="h-8 w-8 text-yellow-300" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-200/65">
              ExFacto
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Customer Support
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Need help accessing your account? Send a request and our support team will reply here.
            </p>
          </div>

          {errorText && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorText}
            </div>
          )}

          {successText && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-100">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {successText}
            </div>
          )}

          {!ticketId ? (
            <form
              onSubmit={handleCreateTicket}
              className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
            >
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  Name
                </span>
                <input
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-yellow-400/60"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  Contact
                </span>
                <input
                  value={guestContact}
                  onChange={(event) => setGuestContact(event.target.value)}
                  placeholder="Phone, Telegram, or email"
                  className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-yellow-400/60"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  Reason
                </span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Login Support"
                  className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-yellow-400/60"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">
                  Message
                </span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what happened..."
                  className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-yellow-400/60"
                />
              </label>

              <button
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 px-5 py-4 font-black text-black shadow-[0_18px_45px_rgba(234,179,8,0.22)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-yellow-100">
                      Support Conversation
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Ticket: {ticketId.slice(0, 8)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadThread()}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white/60 transition hover:text-yellow-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100/75">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Please keep this page on the same browser.
                </div>

                {/* Anti-Phishing Shield Banner for Guests */}
                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-xs leading-5 text-red-200">
                    <strong className="font-black text-red-400">SECURITY NOTICE:</strong> Official staff will <strong>NEVER</strong> ask you to send crypto via chat, Telegram, or to a personal wallet.
                  </p>
                </div>
              </div>

              <div className="min-h-[320px] flex-1 space-y-3 overflow-y-auto p-4">
                {loadingThread && (
                  <div className="rounded-2xl bg-black/25 p-4 text-center text-sm text-white/45">
                    Loading conversation...
                  </div>
                )}

                {!loadingThread && chatMessages.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/25 p-5 text-center">
                    <MessageCircle className="mx-auto mb-2 h-7 w-7 text-yellow-300" />
                    <p className="text-sm font-bold text-white">
                      No messages yet
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Your support request has been created.
                    </p>
                  </div>
                )}

                {!loadingThread &&
                  chatMessages.map((chat) => (
                    <ChatBubble
                      key={chat.id}
                      role={chat.sender_role}
                      message={chat.message}
                      time={chat.created_at}
                    />
                  ))}
              </div>

              <div className="border-t border-white/10 bg-[#0a0a0a] p-4 rounded-b-[2rem]">
                <form onSubmit={handleSendReply} className="flex items-center gap-3">
                  <div className="flex h-[52px] flex-1 items-center rounded-full border border-white/10 bg-[#141414] px-4 focus-within:border-yellow-400/40">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Message..."
                      className="h-full flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/30"
                    />
                  </div>

                  <button
                    disabled={submitting || !replyText.trim()}
                    className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black shadow-[0_4px_15px_rgba(234,179,8,0.25)] transition active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="ml-0.5 h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ChatBubble({
  role,
  message,
  time,
}: {
  role: "user" | "admin";
  message: string;
  time: string;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] rounded-[1.25rem] px-4 py-2.5 shadow-sm ${
          isUser
            ? "rounded-br-sm bg-yellow-500 text-black"
            : "rounded-bl-sm bg-white/15 text-white"
        }`}
      >
        {message && (
          <p className="whitespace-pre-wrap break-words text-[14px] leading-[22px]">
            {message}
          </p>
        )}

        <p className={`mt-1 text-right text-[10px] font-bold ${isUser ? "text-black/50" : "text-white/35"}`}>
          {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}