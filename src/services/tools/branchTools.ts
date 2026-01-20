import { toolRegistry } from './toolRegistry';
import { ToolCategory } from '@/types/tools';

const BRANCH_DATA = {
  angleur: {
    name: 'Tasty Food Angleur',
    address: '123 Rue d\'Angleur, 4031 Angleur',
    phone: '+32 4 XXX XXXX',
    hours: {
      mon_fri: '11:00-23:00',
      sat_sun: '10:00-00:00',
    },
    coordinates: { lat: 50.5, lng: 5.5 },
  },
  'saint-gilles': {
    name: 'Tasty Food Saint-Gilles',
    address: '456 Rue de Saint-Gilles, 4000 Liège',
    phone: '+32 4 YYY YYYY',
    hours: {
      mon_fri: '11:00-23:00',
      sat_sun: '10:00-00:00',
    },
    coordinates: { lat: 50.6, lng: 5.6 },
  },
  wandre: {
    name: 'Tasty Food Wandre',
    address: '789 Rue de Wandre, 4020 Wandre',
    phone: '+32 4 ZZZ ZZZZ',
    hours: {
      mon_fri: '11:00-23:00',
      sat_sun: '10:00-00:00',
    },
    coordinates: { lat: 50.7, lng: 5.7 },
  },
  seraing: {
    name: 'Tasty Food Seraing',
    address: '101 Rue de Seraing, 4100 Seraing',
    phone: '+32 4 AAA AAAA',
    hours: {
      mon_fri: '11:00-23:00',
      sat_sun: '10:00-00:00',
    },
    coordinates: { lat: 50.6, lng: 5.5 },
  },
};

export function registerBranchTools() {
  toolRegistry.register(
    'get_branch_hours',
    {
      name: 'get_branch_hours',
      description: 'Get opening hours for a branch',
      inputSchema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch name: angleur, saint-gilles, wandre, seraing' },
        },
        required: ['branch'],
      },
    },
    async (input: { branch: string }) => {
      const branchKey = input.branch.toLowerCase().replace(/\s+/g, '-');
      const branch = BRANCH_DATA[branchKey as keyof typeof BRANCH_DATA];

      if (!branch) throw new Error(`Branch not found: ${input.branch}`);

      return {
        name: branch.name,
        hours: branch.hours,
        isOpen: checkIfOpen(branch.hours),
      };
    },
    ToolCategory.BRANCH,
  );

  toolRegistry.register(
    'get_branch_contact',
    {
      name: 'get_branch_contact',
      description: 'Get contact info for a branch',
      inputSchema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch name' },
        },
        required: ['branch'],
      },
    },
    async (input: { branch: string }) => {
      const branchKey = input.branch.toLowerCase().replace(/\s+/g, '-');
      const branch = BRANCH_DATA[branchKey as keyof typeof BRANCH_DATA];

      if (!branch) throw new Error(`Branch not found`);

      return {
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        coordinates: branch.coordinates,
      };
    },
    ToolCategory.BRANCH,
  );
}

function checkIfOpen(hours: { mon_fri: string; sat_sun: string }): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const currentHour = now.getHours();

  // Parse hours (simple check)
  const hoursStr = isWeekend ? hours.sat_sun : hours.mon_fri;
  const [openTime, closeTime] = hoursStr.split('-');
  const [openHour] = openTime.split(':').map(Number);
  const [closeHour] = closeTime.split(':').map(Number);

  // Handle midnight closing (00:00 means next day)
  if (closeHour === 0) {
    return currentHour >= openHour || currentHour < 1;
  }

  return currentHour >= openHour && currentHour < closeHour;
}
