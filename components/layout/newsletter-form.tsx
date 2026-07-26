"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="mt-4 text-sm text-champagne">Thank you — you&rsquo;re subscribed.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <Input
        type="email"
        required
        placeholder="Your email"
        className="border-ivory/15 bg-ivory/5 text-ivory placeholder:text-ivory/40"
      />
      <Button type="submit" variant="gold" size="default">
        Join
      </Button>
    </form>
  );
}
