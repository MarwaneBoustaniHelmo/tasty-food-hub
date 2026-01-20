import { toolRegistry } from './toolRegistry';
import { ToolCategory } from '@/types/tools';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

// Register order tools
export function registerOrderTools() {
  toolRegistry.register(
    'get_order_status',
    {
      name: 'get_order_status',
      description: 'Get the status of an order (tracking, ETA, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'Order ID or number' },
          platform: { type: 'string', description: 'Platform: ubereats, deliveroo, takeaway, website' },
        },
        required: ['orderId'],
      },
    },
    async (input: { orderId: string; platform?: string }) => {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', input.orderId)
        .single();

      if (error) throw new Error(`Order not found: ${input.orderId}`);

      return {
        id: order.id,
        status: order.status,
        estimatedArrival: order.estimated_arrival,
        items: order.items,
        total: order.total,
        branch: order.branch,
        platform: order.platform,
        createdAt: order.created_at,
      };
    },
    ToolCategory.ORDER,
  );

  toolRegistry.register(
    'list_user_orders',
    {
      name: 'list_user_orders',
      description: 'List all orders for a user by email',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'User email' },
          limit: { type: 'number', description: 'Max orders to return (default 10)' },
        },
        required: ['email'],
      },
    },
    async (input: { email: string; limit?: number }) => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', input.email)
        .order('created_at', { ascending: false })
        .limit(input.limit || 10);

      if (error) throw new Error('Failed to fetch orders');

      return orders.map((o: any) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.created_at,
      }));
    },
    ToolCategory.ORDER,
  );

  toolRegistry.register(
    'cancel_order',
    {
      name: 'cancel_order',
      description: 'Cancel an order (if cancellable)',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'Order ID' },
          reason: { type: 'string', description: 'Reason for cancellation' },
        },
        required: ['orderId'],
      },
    },
    async (input: { orderId: string; reason?: string }) => {
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', input.orderId)
        .single();

      if (fetchError) throw new Error('Order not found');

      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', cancellation_reason: input.reason })
        .eq('id', input.orderId);

      if (updateError) throw new Error('Cancellation failed');

      return { success: true, orderId: input.orderId, newStatus: 'cancelled' };
    },
    ToolCategory.ORDER,
  );
}
