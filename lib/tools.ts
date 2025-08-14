// Add interface for tools
interface Tool {
    type: 'function';
    name: string;
    description: string;
    parameters?: {
      type: string;
      properties: Record<string, {
        type: string;
        description: string;
      }>;
    };
}

const toolDefinitions = {
    getCurrentTime: {
        description: 'Gets the current time in the user\'s timezone',
        parameters: {}
    },
    changeBackgroundColor: {
        description: 'Changes the background color of the page or switches between light/dark themes', 
        parameters: {
        color: { 
            type: 'string',
            description: 'Color value (hex, rgb, or color name). If not provided, switches between light/dark themes'
        }
        }
    },
    partyMode: {
        description: 'Triggers a confetti animation on the page',
        parameters: {}
    },
    launchWebsite: {
        description: 'Launches a website in the user\'s browser',
        parameters: {
        url: {
            type: 'string',
            description: 'The URL to launch'
        }
        }
    },
    copyToClipboard: {
        description: 'Copies text to the user\'s clipboard',
        parameters: {
        text: {
            type: 'string',
            description: 'The text to copy'
        }
        }
    },
    takeScreenshot: {
        description: 'Takes a screenshot of the current page',
        parameters: {}
    },
    scrapeWebsite: {
        description: 'Scrapes a URL and returns content in markdown and HTML formats',
        parameters: {
            url: {
                type: 'string',
                description: 'The URL to scrape'
            }
        }
    },
    createCampaign: {
        description: 'Navigates to the campaigns page for creating and managing marketing campaigns with voice commands',
        parameters: {}
    },
    openVoiceNotes: {
        description: 'Navigates to the notes page for creating and managing notes with voice commands',
        parameters: {}
    },
    generateReport: {
        description: 'Navigates to the reports page for generating reports with voice commands',
        parameters: {}
    },
    scheduleMeeting: {
        description: 'Schedules a meeting with the specified details',
        parameters: {
            title: {
                type: 'string',
                description: 'Meeting title'
            },
            date: {
                type: 'string',
                description: 'Meeting date and time'
            },
            participants: {
                type: 'string',
                description: 'Meeting participants'
            }
        }
    },
    showHelp: {
        description: 'Shows the voice command assistant with all available commands',
        parameters: {}
    },
    createNote: {
        description: 'Creates a new note and opens the note creation form',
        parameters: {}
    },
    saveNote: {
        description: 'Saves the current note being created',
        parameters: {}
    },
    goHome: {
        description: 'Navigates back to the home page',
        parameters: {}
    },
    setNoteTitle: {
        description: 'Sets the title for the current note being created',
        parameters: {
            title: {
                type: 'string',
                description: 'The title text for the note'
            }
        }
    },
    setNoteContent: {
        description: 'Sets the content for the current note being created',
        parameters: {
            content: {
                type: 'string',
                description: 'The content text for the note'
            }
        }
    },
    addNoteTag: {
        description: 'Adds a tag to the current note being created',
        parameters: {
            tag: {
                type: 'string',
                description: 'The tag to add to the note'
            }
        }
    },
    // Herramientas específicas para el asistente de reportes
    createReport: {
        description: 'Creates a new report and opens the report creation form',
        parameters: {}
    },
    saveReport: {
        description: 'Saves the current report being created',
        parameters: {}
    },
    goToCampaigns: {
        description: 'Navigates to the campaigns page',
        parameters: {}
    },
    goToNotes: {
        description: 'Navigates to the notes page',
        parameters: {}
    },
    setReportTitle: {
        description: 'Sets the title for the current report being created',
        parameters: {
            title: {
                type: 'string',
                description: 'The title text for the report'
            }
        }
    },
    setReportType: {
        description: 'Sets the type for the current report being created',
        parameters: {
            type: {
                type: 'string',
                description: 'The type of report (ventas, marketing, financiero, proyecto, general)'
            }
        }
    },
    setReportContent: {
        description: 'Sets the content for the current report being created',
        parameters: {
            content: {
                type: 'string',
                description: 'The content text for the report'
            }
        }
    },
    setReportData: {
        description: 'Sets additional data for the current report being created',
        parameters: {
            data: {
                type: 'string',
                description: 'Additional data for the report'
            }
        }
    }
} as const;

const tools: Tool[] = Object.entries(toolDefinitions).map(([name, config]) => ({
    type: "function",
    name,
    description: config.description,
    parameters: {
    type: 'object',
    properties: config.parameters
    }
}));


export type { Tool };
export { tools };