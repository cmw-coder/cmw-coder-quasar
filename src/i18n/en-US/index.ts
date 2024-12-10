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
          description: 'We have sent code to your mailbox and WeCom.',
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
    ReviewPanels: {
      FunctionPanel: {
        labels: {
          locate: 'Locate',
          locateTitle: 'Locate File In Directory',
          depthTitle: 'Depth: ${depth}',
          typeTitle: 'Type: ${type}',
          referencesTitle: 'Find References',
          viewReferenceCode: 'View',
          viewReferenceCodeTitle: 'View Reference Code',
          empty: 'Empty',
          referenceLoading: 'Finding References...',
          reviewProgressTitle: 'Review Progress',
          reviewResultTitle: 'Review Result',
          reviewStepOne: 'AI Is Reviewing Your Code',
          reviewStepTwo: '2/3 Reviewer And Coder Are In A Heated Battle',
          reviewStepThree: '3/3 AI IS Summarizing',
          parsedFailed: 'Parse Failed',
          noProblem: 'No Problem',
          error: 'Error',
          retry: 'Retry',
          stop: 'Stop',
          useless: 'Useless',
          rejectDialogTitle: 'Reject',
          rejectDialogConfirm: 'Submit',
          rejectDialogCancel: 'Cancel',
          helpful: 'Helpful',
          referenceViewDialogTitle: 'Reference Code',
          expand: 'Expand',
          collapse: 'Collapse',
          queuing: 'Queuing',
        },
      },
    },
    SettingCards: {
      CompletionCard: {
        labels: {
          title: 'Code Completion',
          productLine: 'Product Line',
          model: 'Model',
          completionOnPaste: 'Trigger Completion On Paste',
          debounceDelay: 'Trigger Debounce Delay',
          interactionUnlockDelay: 'User Interaction Unlock Delay',
          prefixLineCount: 'Context Prefix Line Count',
          recentFileCount: 'Recent Accessed File Count',
          suffixLineCount: 'Context Suffix Line Count',
          rangeHint: 'Range: {min} ~ {max}',
        },
        tooltips: {
          resetToDefault: 'Reset to default',
        },
      },
      GeneralCard: {
        labels: {
          backupInterval: 'Backup Interval',
          backupIntervalNotice:
            'Range: 0 - 1140. The interval of auto backup, set to 0 to disable auto backup',
          baseServerUrl: 'Base Server Address',
          developerOptions: 'Developer Options',
          displayTheme: 'Display Theme',
          displayThemeOptions: {
            auto: 'Auto',
            dark: 'Dark',
            light: 'Light',
          },
          locale: 'Language',
          minutes: 'minutes',
          showSelectActionWindow: 'Show Selection Action Window',
          showSelectActionWindowNotice:
            'Disable this option to prevent the action window from appearing when you select the code.\n' +
            'You can still use CTRL + I or CTRL + L for relevant operations.',
          showStatusWindow: 'Show Generate Status Window',
          showStatusWindowNotice:
            'Disable this option to stop the status window from appearing when the editor launches.',
          title: 'General',
          transparentFallback: 'Transparent fallback (Windows 7)',
          zoomFix: 'Fix window zoom',
        },
        tooltips: {
          resetToDefault: 'Reset to default',
        }
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
      ProjectIdCard: {
        labels: {
          title: 'Project Code',
          btnEdit: 'Edit',
          btnDel: 'Delete',
          delDialogTitle: 'Delete Project',
          delDialogMessage: 'Are you sure you want to delete this project?',
          delDialogCancel: 'Cancel',
          delDialogConfirm: 'Confirm',
          editDialogCancel: 'Cancel',
          editDialogConfirm: 'Confirm',
          auto: 'Auto',
          manual: 'Manual',
          idInputLabel: 'Project ID',
          idInputHint:
            'Enter Project ID (NV project serial number or TB issue number)',
          idInputError: 'Invalid Project ID',
          autoManagedInputLabel: 'Auto-manage SVN directory',
          svnManagedLabel: 'SVN Directory: ',
          addSvnDir: 'Add SVN Directory',
          delSvnDir: 'Delete',
        },
      },
    },
    WelcomePanels: {
      AutoPanel: {
        labels: {
          title: 'Detecting network zone...',
        },
      },
      FinishPanel: {
        labels: {
          confirm: 'Confirm',
          title: 'You are all set!',
          tip: 'You can change common settings here or just start using Comware Coder.',
        },
      },
      ManualPanel: {
        labels: {
          normalArea: 'Red',
          publicArea: 'Yellow/Green',
          secureArea: 'Red Route',
          title: 'Auto detect network zone failed, please setup manually',
        },
        notifications: {
          pingError:
            'Failed to ping the server, Please check your network connection.',
          pingSuccess: 'Successfully pinged the server',
        },
        steps: [
          {
            title: 'Select network zone',
            next: 'Continue',
            previous: 'Detect again',
          },
          { title: 'Set base server url', next: 'Finish', previous: 'Back' },
        ],
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
          review: 'Review',
          settings: 'Settings',
          workflow: 'Workflow',
        },
      },
      RightReviewHistoryDrawer: {
        labels: {
          title: 'Pick Review History',
        },
        tooltips: {},
      },
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
        toolbar: {
          rightDrawer: {
            reviewHistory: 'Review History',
          },
          title: {
            chat: 'Chat',
            commit: 'Commit',
            feedback: 'Feedback',
            review: 'Review',
            settings: 'Settings',
            workflow: 'Workflow',
          },
        },
        tooltips: {
          close: 'Close',
          defaultSize: 'Restore default size',
          minimize: 'Minimize',
          toggleMaximize: 'Toggle maximize',
          fix: 'Window is Fixed',
          unfix: 'Window is Unfixed',
        },
      },
      ReviewHeader: {
        labels: {
          title: 'Comware Coder',
        },
        toolbar: {
          rightBtn: {
            reviewHistory: 'Review History',
            back: 'Back',
          },
          title: {
            chat: 'Chat',
            commit: 'Commit',
            feedback: 'Feedback',
            review: 'Review',
            reviewHistory: 'Review History',
            settings: 'Settings',
            workflow: 'Workflow',
          },
        },
        tooltips: {
          close: 'Close',
          defaultSize: 'Restore default size',
          minimize: 'Minimize',
          toggleMaximize: 'Toggle maximize',
          fix: 'Window is Fixed',
          unfix: 'Window is Unfixed',
        },
      },
    },
  },
  pages: {
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
    CompletionsPage: {
      labels: {
        title: {
          Common: 'Common Completion',
          PasteReplace: 'Fix Paste Content',
        },
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
        description: 'Current project folder: {project}',
        intro:
          'You need to provide Project ID in order to statistics your coding behavior.',
        temporary: 'This is a temporary project',
        title: 'Setup New Project',
      },
    },
    ReviewPage: {
      labels: {
        currentFile: 'Current file: {file}',
        noFile: 'No file selected, please open a file in your editor',
        reviewFile: 'Review current file',
        delFileTitle: 'Delete file',
        projectReview: 'Project Review',
        clear: 'Clear ',
        loading: 'Loading...',
      },
      dialog: {
        delReviewItemDialog: {
          title: 'Notice',
          message: 'The current review has not ended',
          ok: 'Stop and delete',
          cancel: 'Cancel',
        },
        delFileDialog: {
          title: 'Notice',
          message: 'There are still reviews pending under the current file',
          ok: 'Stop all and delete',
          cancel: 'Cancel',
        },
        clearReviewDialog: {
          title: 'Clear all reviews',
          message: 'Are you sure you want to clear all reviews?',
          ok: 'Confirm',
          cancel: 'Cancel',
        },
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
    WelcomePage: {
      labels: {
        title: 'Welcome to Comware Coder',
      },
      notifications: {
        configError: 'Failed to save the configuration',
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
    SelectionTipsPage: {
      labels: {
        addToChat: 'Add to chat (Ctrl + Alt + I)',
        review: 'Review highlight code (Ctrl + Alt + L)',
      },
    },
    StatusPage: {
      labels: {
        ERROR: 'Error',
        GENERATING: 'Generating...',
        READY: 'Ready',
      },
    },
  },
};
