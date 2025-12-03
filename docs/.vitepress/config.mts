import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Designs",
  description: "My Designs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Code Review Agent', link: '/designs/code-review-agent' }
    ],

    sidebar: [
      {
        text: 'Designs',
        items: [
          { text: 'Code Review Agent', link: '/designs/code-review-agent' },
          { text: "Workflow", link: '/designs/code-review-agent/workflow' },
          { text: "FAQ", link: '/designs/code-review-agent/faq' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lushevol' }
    ]
  }
})
