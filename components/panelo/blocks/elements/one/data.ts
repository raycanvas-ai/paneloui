export interface Agent {
    id: string
    name: string
    role: string
    description: string
    lastActive: string
}

export const agents: Agent[] = [
    {
        id: 'agent-sarah',
        name: 'Sarah',
        role: 'Support Agent',
        description: 'Triages incoming tickets, resolves common questions instantly, and escalates complex cases to human teammates.',
        lastActive: '2 hours ago',
    },
    {
        id: 'agent-alex',
        name: 'Alex',
        role: 'Data Analyst',
        description: 'Processes large datasets, generates visual reports, and surfaces actionable business insights for every Acmeflow team.',
        lastActive: '2 hours ago',
    },
]
