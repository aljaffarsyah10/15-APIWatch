"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does APIWatch protect against SSRF and private network scanning?",
    answer:
      "All monitor URLs undergo strict multi-layered validation before probe execution. We resolve target hostnames to IP addresses using strict DNS lookups and drop all requests directed towards private RFC-1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), loopbacks (127.0.0.1), link-local addresses, and cloud provider metadata endpoints (169.254.169.254).",
  },
  {
    question: "How are custom API keys and Bearer tokens kept secure?",
    answer:
      "Any sensitive HTTP headers configured on your monitors are encrypted at rest with authenticated AES-256-GCM encryption using unique 96-bit initialization vectors (IV). Secret keys never touch client JavaScript or public responses and are decrypted strictly inside worker memory during probe execution.",
  },
  {
    question: "What is the minimum check frequency available?",
    answer:
      "APIWatch supports polling intervals as frequent as 30 seconds. Background jobs are queued and distributed across Redis BullMQ worker clusters with monotonic timers, ensuring millisecond-level precision without drift.",
  },
  {
    question: "How does the deduplication engine prevent alert notification fatigue?",
    answer:
      "During prolonged outages, APIWatch prevents notification storms by enforcing an intelligent cooldown window (defaulting to 15 minutes). You receive an instant alert on initial failure, suppressed duplicate alerts while the incident remains open, and an automatic resolution notification once your API recovers.",
  },
  {
    question: "Is the Public Status Page resilient if our own backend experiences issues?",
    answer:
      "Yes. The Public Status Page is engineered with Next.js 16 Partial Prerendering (PPR). The static shell is served globally from Edge CDN caches with instant delivery, while telemetry indicators stream dynamically via isolated read-only queries with zero internal secret exposure.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-xl border border-border/80 bg-card/85 backdrop-blur-md overflow-hidden transition-all duration-200 card-elevated"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4.5 w-4.5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                  isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}