module.exports = {
  plugins: [
    require("postcss-import"),
    require("@fullhuman/postcss-purgecss")({
      content: ["./*.html", "./scripts/**/*.js"],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          // Applied by JS at runtime, so the extractor never sees them used.
          "dark",
          "light",
          // The grain overlay and the mark's arrival spin are on <body> and a
          // <span> respectively; both are real classes in the markup, but keep
          // them explicit so a future markup tweak can't silently drop them.
          "has-grain",
          "intro",
          "letters",
        ],
        // :root[data-theme='dark'] rules — purgecss matches on the selector's
        // extracted words, and "data-theme" only ever appears inside the inline
        // <head> script, which is not in the content globs above.
        greedy: [/data-theme/],
      },
    }),
    require("cssnano")({ preset: "default" }),
  ],
};
