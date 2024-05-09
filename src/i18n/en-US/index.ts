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
    ChatMessages: {
      labels: {
        copySelected: 'Copy selected',
        copyAll: 'Copy all',
      },
      notifications: {
        copySuccess: 'Selection copied to the clipboard',
        copyFailure: 'Failed to copy the selection',
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
    MessageItems: {
      AnswerItem: {
        notifications: {
          copyFailure: 'Failed to copy the answer',
          copyManual: 'Please copy the answer manually',
          copySuccess: 'The answer has been copied to the clipboard',
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
          title: 'Code Completion',
          productLine: 'Product Line',
          model: 'Model',
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
          zoomFix: 'Fix window zoom',
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
          commit: 'Commit',
          feedback: 'Feedback',
          settings: 'Settings',
          workflow: 'Workflow',
        },
      },
      RightMainDrawer: {},
    },
    footers: {
      QuestionFooter: {
        labels: {
          thinking: 'Thinking...',
        },
        tooltips: {
          newTopic: 'Start a new topic',
        },
      },
    },
    headers: {
      FloatingHeader: {
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
    CommitPage: {
      labels: {
        cancel: 'Cancel',
        changes: 'Changed Files',
        commit: 'Commit',
        generate: 'Generate',
        message: 'Commit Message',
        noSelect: 'No file selected',
        refresh: 'Refresh',
        selectRepo: 'Select SVN Repository',
        title: 'Commit Your Codes',
      },
      tooltips: {
        generate: 'Generate Commit Message From AI',
        generating: 'Generating...',
      },
      notifications: {
        commitFailed: 'Commit failed',
        commitSuccess: 'Commit successfully',
        generateFailed: 'Failed to generate commit message',
        invalidProject: 'Invalid project',
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
    StartSettingPage: {
      labels: {
        title: 'Please set your environment',
        stepOneTitle: 'Select network zone',
        stepTwoTitle: 'Set base server url',
        redArea: 'Red',
        normalArea: 'Yellow/Green',
        redRouteArea: 'Red Route',
        finish: 'Finish',
        continue: 'Continue',
        back: 'Back',
      },
      notifications: {
        pingError:
          'Failed to ping the server, Please check your network connection.',
        pingSuccess: 'Successfully pinged the server',
      },
    },
    ProjectIdPage: {
      labels: {
        confirm: 'Confirm',
        description: 'Current project folder: {project}',
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
    WorkflowPage: {
      labels: {
        agentAudit: 'Waiting for agent audit...',
        compileCode: 'Compiling Code...',
        copyWorkflowId: 'Copy workflow ID',
        deleteWorkflow: 'Delete workflow',
        deployArtifact: 'Deploying Artifact...',
        staticCheck: 'Performing static check...',
      },
      notifications: {
        copyFailure: 'Failed to copy the workflow ID',
        copySuccess: 'This workflow ID has been copied to the clipboard',
      },
    },
  },
};
