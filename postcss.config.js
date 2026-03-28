module.exports = {
  plugins: [
    require("postcss-import"),
    require("@fullhuman/postcss-purgecss")({
      content: ["./*.html", "./scripts/**/*.js", "./content/**/*.md"],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          "js",
          "nav-pill-indicator",
          "nav-pill-ghost",
          "is-visible",
          "page-ready",
          "is-leaving",
          "scroll-reveal",
        ],
        greedy: [/markdown-article/],
      },
    }),
    require("cssnano")({ preset: "default" }),
  ],
};
