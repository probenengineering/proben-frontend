"use client";

import { useState, type FormEvent } from "react";

// Tracks whether every `required` field in a form has something typed in it.
// Spread `onInput` on the <form>, then use `complete` to enable the primary button.
export function useFormComplete() {
  const [complete, setComplete] = useState(false);

  function onInput(event: FormEvent<HTMLFormElement>) {
    const fields = Array.from(event.currentTarget.elements) as HTMLInputElement[];
    setComplete(fields.filter((field) => field.required).every((field) => field.value.trim()));
  }

  return { complete, onInput };
}
