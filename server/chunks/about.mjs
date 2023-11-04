import { defineEventHandler } from 'h3';

const about = defineEventHandler(() => {
  return [
    {
      id: 1,
      description: {
        en: "English.",
        id_ID: "Indonesia."
      }
    }
  ];
});

export { about as default };
//# sourceMappingURL=about.mjs.map
