import { toolRegistry } from './toolRegistry';
import { ToolCategory } from '@/types/tools';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

export function registerTicketTools() {
  toolRegistry.register(
    'create_support_ticket',
    {
      name: 'create_support_ticket',
      description: 'Create a new support ticket',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'User email' },
          subject: { type: 'string', description: 'Issue subject' },
          description: { type: 'string', description: 'Detailed description' },
          category: { type: 'string', description: 'Category: complaint, refund, missing_item, wrong_order' },
          priority: { type: 'string', description: 'Priority: low, normal, high, urgent' },
          orderId: { type: 'string', description: 'Related order ID (optional)' },
        },
        required: ['email', 'subject', 'description'],
      },
    },
    async (input: {
      email: string;
      subject: string;
      description: string;
      category?: string;
      priority?: string;
      orderId?: string;
    }) => {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            email: input.email,
            subject: input.subject,
            description: input.description,
            category: input.category || 'general',
            priority: input.priority || 'normal',
            order_id: input.orderId,
            status: 'open',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw new Error('Ticket creation failed: ' + error.message);

      return {
        ticketId: ticket.id,
        status: ticket.status,
        createdAt: ticket.created_at,
        deepLink: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/chat?ticketId=${ticket.id}`,
      };
    },
    ToolCategory.TICKET,
  );

  toolRegistry.register(
    'get_ticket_status',
    {
      name: 'get_ticket_status',
      description: 'Get the status of a support ticket',
      inputSchema: {
        type: 'object',
        properties: {
          ticketId: { type: 'string', description: 'Ticket ID' },
        },
        required: ['ticketId'],
      },
    },
    async (input: { ticketId: string }) => {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', input.ticketId)
        .single();

      if (error) throw new Error('Ticket not found');

      return {
        id: ticket.id,
        status: ticket.status,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        assignedAgent: ticket.assigned_agent,
      };
    },
    ToolCategory.TICKET,
  );
}
