import { HuggingFaceModelType, LinseerModelType } from 'shared/types/model';

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
          intro: 'Welcome to Comware Coder',
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
    SettingCards: {
      CompletionCard: {
        labels: {
          availableModels: {
            [HuggingFaceModelType.ComwareV1]: 'Comware V1',
            [HuggingFaceModelType.ComwareV2]: 'Comware V2',
            [LinseerModelType.Linseer]: 'Linseer',
            [LinseerModelType.Linseer_SR88Driver]:
              'Linseer for SR88 Driver Team',
            [LinseerModelType.Linseer_CClsw]: 'Linseer for CClsw Team',
          },
          currentModel: 'Current model',
          title: 'Code Completion',
        },
      },
      GeneralCard: {
        labels: {
          developerOptions: 'Developer Options',
          displayTheme: 'Display Theme',
          displayThemeOptions: {
            auto: 'Auto',
            dark: 'Dark',
            light: 'Light',
          },
          title: 'General',
          transparentFallback: 'Transparent fallback (Windows 7)',
          zoomFIx: 'Fix window zoom',
        },
      },
      UpdateCard: {
        labels: {
          appVersion: 'Application version',
          checkForUpdate: 'Check for update immediately',
          title: 'Update',
        },
        notifications: {
          developerModeOngoing:
            'Click {times} more times to enable developer mode',
          developerModeEnabled: 'Developer mode enabled',
        },
      },
    },
  },
  layouts: {
    drawers: {
      LeftMainDrawer: {
        navigations: {
          chat: 'Chat',
          feedback: 'Feedback',
          settings: 'Settings',
        },
      },
      RightMainDrawer: {},
    },
    footers: {},
    headers: {
      FloatingHeader: {
        labels: {
          title: 'Comware Coder',
        },
      },
      MainHeader: {
        labels: {
          title: 'Comware Coder',
        },
        tooltips: {
          close: 'Close',
          defaultSize: 'Restore default size',
          minimize: 'Minimize',
          toggleMaximize: 'Toggle maximize',
        },
      },
    },
  },
  pages: {
    ChatPage: {
      labels: {
        intro: 'AI assisted coding for H3C',
        title: 'Comware Coder',
      },
    },
    DeveloperPage: {
      labels: {
        currentFile: 'Current File',
        referenceFiles: 'Reference Files',
      },
    },
    FeedbackPage: {
      labels: {
        title: 'Issue Feedback',
        account: 'Account',
        description: 'Issue description',
        images: 'Related Images',
        cancel: 'Cancel',
        submit: 'Submit',
      },
      hints: {
        account: 'Please enter your H3C account (Job number)',
      },
      notifications: {
        feedbackSuccess: 'Feedback submitted',
        feedbackFailed: 'Feedback failed',
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
    SettingsPage: {
      labels: {
        title: 'Settings',
      },
    },
    UpdatePage: {
      labels: {
        cancel: 'Not now',
        confirm: 'Upgrade',
        title: 'New version available',
        currentVersion: 'Current version:',
        newVersion: 'New version:',
        releaseDate: 'Release date: {releaseDate}',
      },
    },
  },
};
