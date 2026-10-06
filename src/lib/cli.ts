/**
 * CLI helpers for content scripts
 * Simple prompts via readline, no external deps
 */

import readline from "node:readline";

export function prompt(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(q, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

export async function promptNumber(question: string, defaultValue?: number): Promise<number | null> {
  const answer = await prompt(question, defaultValue?.toString());
  if (!answer) return null;
  const num = Number(answer);
  return isNaN(num) ? null : num;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function logStep(msg: string) {
  console.log(`\n✦ ${msg}`);
}

export function logSuccess(msg: string) {
  console.log(`✅ ${msg}`);
}

export function logWarn(msg: string) {
  console.log(`⚠️  ${msg}`);
}
