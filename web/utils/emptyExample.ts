import type { ExampleRow } from "@/utils/cardFormTypes";
import { newExampleKey } from "@/utils/newExampleKey";

export function emptyExample(): ExampleRow {
  return { key: newExampleKey(), german: "", english: "", audio: "" };
}
