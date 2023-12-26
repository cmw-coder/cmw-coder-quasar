export default {
  components: {
    CodeBlock: {
      tooltips: {
        copy: 'Copy to clipboard',
        insert: 'Insert to editor',
      },
    },
    DarkModeButton: {
      labels: {
        toggleDarkMode: 'Toggle dark mode',
      },
    },
    AccountInput: {
      errors: {
        account: 'Invalid account',
      },
      labels: {
        account: 'Account (Job Number)',
      },
    },
  },
  layouts: {
    drawers: {
      LeftMainDrawer: {},
      RightMainDrawer: {},
    },
    footers: {},
    headers: {
      FloatingHeader: {
        labels: {
          title: 'Comware Coder Assistant',
        },
      },
      MainHeader: {
        labels: {
          title: 'Comware Coder Assistant',
        },
      },
    },
  },
  pages: {
    DashboardPage: {
      labels: {
        title: 'Comware Coder Assistant',
        intro: 'AI assisted coding for H3C',
      },
      tooltips: {
        copy: 'Copy to clipboard',
        insert: 'Insert to editor',
      },
    },
    LoginPage: {
      labels: {
        title: 'Login to Use Linseer AI',
      },
    },
  },
};
