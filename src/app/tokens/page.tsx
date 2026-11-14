// TEMPORARY preview of the design tokens, for checking against Figma.
// Delete this folder once the tokens are confirmed.

const colorGroups: { name: string; swatches: [string, string][] }[] = [
  {
    name: "Proben Green (primary)",
    swatches: [
      ["green-50", "bg-green-50"],
      ["green-100", "bg-green-100"],
      ["green-200", "bg-green-200"],
      ["green-300", "bg-green-300"],
      ["green-400", "bg-green-400"],
      ["green-500 (base)", "bg-green-500"],
      ["green-600", "bg-green-600"],
      ["green-700", "bg-green-700"],
      ["green-800", "bg-green-800"],
      ["green-900", "bg-green-900"],
      ["green-link", "bg-green-link"],
    ],
  },
  {
    name: "Proben Navy (secondary)",
    swatches: [
      ["navy-50", "bg-navy-50"],
      ["navy-100", "bg-navy-100"],
      ["navy-200", "bg-navy-200"],
      ["navy-300", "bg-navy-300"],
      ["navy-400", "bg-navy-400"],
      ["navy-500 (base)", "bg-navy-500"],
      ["navy-600", "bg-navy-600"],
      ["navy-700", "bg-navy-700"],
      ["navy-800", "bg-navy-800"],
      ["navy-900", "bg-navy-900"],
    ],
  },
  {
    name: "Black",
    swatches: [
      ["black-10", "bg-black-10"],
      ["black-20", "bg-black-20"],
      ["black-30", "bg-black-30"],
      ["black-40", "bg-black-40"],
      ["black-50", "bg-black-50"],
      ["black-60", "bg-black-60"],
      ["black-70", "bg-black-70"],
      ["black-80", "bg-black-80"],
      ["black-90", "bg-black-90"],
      ["black", "bg-black"],
    ],
  },
  {
    name: "White",
    swatches: [
      ["white", "bg-white"],
      ["white-50", "bg-white-50"],
      ["white-200", "bg-white-200"],
      ["white-300", "bg-white-300"],
      ["white-400", "bg-white-400"],
      ["white-500", "bg-white-500"],
      ["white-600", "bg-white-600"],
      ["white-700", "bg-white-700"],
    ],
  },
  {
    name: "Grey (component variables)",
    swatches: [
      ["grey-100", "bg-grey-100"],
      ["grey-200", "bg-grey-200"],
      ["grey-300", "bg-grey-300"],
      ["grey-400", "bg-grey-400"],
      ["grey-500", "bg-grey-500"],
      ["grey-600", "bg-grey-600"],
      ["grey-700", "bg-grey-700"],
      ["grey-900", "bg-grey-900"],
      ["secondary-100", "bg-secondary-100"],
    ],
  },
  {
    name: "Semantic",
    swatches: [
      ["success", "bg-success"],
      ["success-100", "bg-success-100"],
      ["success-200", "bg-success-200"],
      ["success-400", "bg-success-400"],
      ["success-500", "bg-success-500"],
      ["success-600", "bg-success-600"],
      ["warning", "bg-warning"],
      ["warning-50", "bg-warning-50"],
      ["warning-700", "bg-warning-700"],
      ["error", "bg-error"],
      ["error-50", "bg-error-50"],
      ["error-200", "bg-error-200"],
      ["error-500", "bg-error-500"],
      ["error-700", "bg-error-700"],
    ],
  },
];

const textStyles: [string, string][] = [
  ["type-display-lg", "type-display-lg"],
  ["type-display-md", "type-display-md"],
  ["type-display-sm", "type-display-sm"],
  ["type-heading-lg", "type-heading-lg"],
  ["type-heading-md", "type-heading-md"],
  ["type-heading-sm", "type-heading-sm"],
  ["type-title-lg", "type-title-lg"],
  ["type-title-md", "type-title-md"],
  ["type-title-sm", "type-title-sm"],
  ["type-paragraph-lg", "type-paragraph-lg"],
  ["type-paragraph-md", "type-paragraph-md"],
  ["type-paragraph-sm", "type-paragraph-sm"],
  ["type-paragraph-xs", "type-paragraph-xs"],
  ["type-caption-lg", "type-caption-lg uppercase"],
  ["type-caption-sm", "type-caption-sm"],
  ["type-caption-xs", "type-caption-xs uppercase"],
];

const weights = ["font-normal", "font-medium", "font-semibold", "font-bold"];

export default function TokensPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 p-6 md:p-12">
      <h1 className="type-heading-lg font-semibold">Design tokens</h1>

      <section className="flex flex-col gap-8">
        <h2 className="type-heading-sm font-semibold">Colours</h2>
        {colorGroups.map((group) => (
          <div key={group.name} className="flex flex-col gap-3">
            <h3 className="type-title-md font-medium text-grey-700">{group.name}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {group.swatches.map(([label, bg]) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className={`h-16 rounded-md border border-grey-200 ${bg}`} />
                  <span className="type-paragraph-xs text-grey-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="type-heading-sm font-semibold">Text styles</h2>
        {textStyles.map(([label, cls]) => (
          <div key={label} className="flex flex-col gap-2 border-b border-grey-200 pb-4">
            <span className="type-paragraph-xs text-grey-500">{label}</span>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {weights.map((weight) => (
                <span key={weight} className={`${cls} ${weight} text-grey-900`}>
                  Proben {weight.replace("font-", "")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
