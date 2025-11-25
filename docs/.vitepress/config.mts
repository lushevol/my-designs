import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Designs",
  description: "My Designs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Code Review Agent', link: '/designs/code-review-agent' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'Designs',
        items: [
          { text: 'Code Review Agent', link: '/designs/code-review-agent' },
          { text: "Workflow", link: '/designs/code-review-agent/workflow' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lushevol' }
    ]
  }
})
