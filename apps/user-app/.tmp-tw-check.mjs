// Temporary verification: run the real tailwind postcss pipeline over BOTH CSS
// entries the app loads (ui globals + app globals), merge, and check classes.
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import fs from "node:fs";

async function compile(file) {
  let input = fs.readFileSync(file, "utf8");
  const out = await postcss([tailwind()]).process(input, { from: file, to: "out.css" });
  return out.css;
}

const ui = await compile("../../packages/ui/src/styles/globals.css");
const app = await compile("app/globals.css");
const merged = ui + "\n" + app;
fs.writeFileSync(".tmp-out.css", merged);

const checks = {
  // app page utilities (must NOT be lost)
  "app:bg-blue-50": "bg-blue-50",
  "app:text-3xl": "text-3xl",
  "app:flex-1": "flex-1",
  // ui sidebar component utilities (the actual fix target)
  "ui:sidebar-wrapper": "group/sidebar-wrapper",
  "ui:data-slot-sidebar": '.data-slot="sidebar"',
  "ui:w-(--sidebar-width)": "w-(--sidebar-width)",
  "ui:collapsible": "collapsible",
  // theme-token sidebar utilities + app-level sidebar classes
  "ui:bg-sidebar": "bg-sidebar",
  "ui:text-sidebar-foreground": "text-sidebar-foreground",
  "app:size-6": "size-6",
  "ui:group-data-collapsible": "collapsible=icon",
};
for (const [name, needle] of Object.entries(checks)) {
  console.log(`${name}: ${merged.includes(needle)}`);
}
console.log("ui bytes:", ui.length, "| app bytes:", app.length);