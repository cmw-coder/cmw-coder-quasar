export default {
  components: {
    AccountInput: {
      errors: {
        account: 'Invalid account (Too short)',
      },
      hints: {
        account: 'Please enter your H3C account (Job number)',
      },
      labels: {
        account: 'Account',
      },
    },
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
    LoginPanels: {
      AccountPanel: {
        errors: {
          account: 'Invalid account (Too short)',
        },
        labels: {
          account: 'Account',
          continue: 'Continue',
          description: 'You need to sign in in order to use this app.',
          intro: 'Welcome to Comware Coder Assistant',
        },
        hints: {
          account: 'Please enter your H3C account (Job number)',
        },
        notifications: {
          codeFailed: 'Failed to send verification code',
          networkCaption: 'Please check your network',
        },
      },
      CodePanel: {
        errors: {
          code: 'Invalid code (Too short)',
        },
        labels: {
          goBack: 'Go back',
          code: 'Verification Code',
          description:
            'We have sent a verification code to your mailbox and WeCom.',
          resend: 'resend the code',
          resending: 'resending',
          resendAfter: '.',
          resendBefore: 'Did not receive the code? Check your junk inbox or ',
          signIn: 'Sign in',
        },
        notifications: {
          codeFailed: 'Failed to send verification code',
          codeSent: 'Verification code sent',
          loginFailed: 'Login failed',
          loginSuccess: 'Login successfully',
          networkCaption: 'Please check your network',
        },
      },
    },
    ProjectIdInput: {
      errors: {
        projectId: 'Invalid Project ID',
      },
      hints: {
        projectId: 'Please enter project ID (NV number or TB number)',
      },
      labels: {
        projectId: 'Project ID',
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
        intro: 'AI assisted coding for H3C',
        title: 'Comware Coder Assistant',
      },
      tooltips: {
        copy: 'Copy to clipboard',
        insert: 'Insert to editor',
      },
    },
    FeedbackPage: {
      labels: {
        title: 'Issue Feedback',
        account: 'Account',
        description: 'Issue description',
        images: 'Related Images',
        submit: 'Submit',
      },
      hints: {
        account: 'Please enter your H3C account (Job number)',
      },
    },
    LoginPage: {
      labels: {
        title: 'Welcome',
      },
    },
    ProjectIdPage: {
      labels: {
        confirm: 'Confirm',
        description: 'Current project path: {path}',
        intro:
          'You need to provide Project ID in order to statistics your coding behavior.',
        temporary: 'This is a temporary project',
        title: 'Setup New Project',
      },
    },
  },
};
