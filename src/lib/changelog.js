export const CHANGELOG = [
    {
        version: '1.0.1',
        date: '2026-09-22',
        title: 'Release App to public',
        changes: [
            {
                type: 'added',
                text: 'App ready to rolling out',
            },
            {
                type: 'improved',
                text: 'New user can try to sign up to start their Expense Tracker',
            }
        ],
    },
    {
        version: '0.7.1',
        date: '2026-09-21',
        title: 'Bulk Update Management',
        changes: [
            {
                type: 'added',
                text: 'Addition of a bulk update feature that allows updating only three key fields: category, payment type, and cash flow type.',
            },
            {
                type: 'improved',
                text: 'Displaying a grand total for the Amount column in the detail DataTable.',
            }
        ],
    },
    {
        version: '0.6.0',
        date: '2026-09-21',
        title: 'Session management',
        changes: [
            {
                type: 'added',
                text: 'Active sessions on the Profile page: see every device where you are signed in.',
            },
            {
                type: 'added',
                text: 'Sign out a single device, or all other devices at once.',
            },
            {
                type: 'improved',
                text: 'Cards are easier to tell apart from the background in light mode.',
            },
            {
                type: 'improved',
                text: 'Add theme toggle on mobile mode',
            },
        ],
    },
    {
        version: '0.5.1',
        date: '2026-09-21',
        changes: [
            {
                type: 'improved',
                text: 'The navbar shows a placeholder while your profile loads, so it no longer jumps.',
            },
            {
                type: 'fixed',
                text: 'The sidebar no longer overlaps the navbar on desktop.',
            },
        ],
    },
];