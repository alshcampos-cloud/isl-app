/**
 * proposals.ts — Proposal Approve/Reject API
 *
 * Allows Lucas to approve or reject PM Agent proposals from the dashboard.
 *
 * POST /api/proposals
 * Body: { proposalId: string, action: 'approve' | 'reject', reason?: string }
 *
 * Authenticated via Supabase auth token — only whitelisted users can act.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ALLOWED_EMAILS = ['alshwenbearcampos@gmail.com'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No auth token provided' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    // Verify user
    const userSupabase = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || '');
    const { data: { user }, error: authError } = await userSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user || !ALLOWED_EMAILS.includes(user.email || '')) {
      return res.status(403).json({ error: 'Unauthorized — only Lucas can approve proposals' });
    }

    const { proposalId, action, reason } = req.body || {};

    if (!proposalId || !action) {
      return res.status(400).json({ error: 'Missing proposalId or action' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }

    // Use service role to update
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify proposal exists and is pending
    const { data: proposal, error: fetchError } = await supabase
      .from('agent_proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (fetchError || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        error: `Proposal is already ${proposal.status}`,
        proposal,
      });
    }

    // Update proposal
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { data: updated, error: updateError } = await supabase
      .from('agent_proposals')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
        rejection_reason: action === 'reject' ? (reason || null) : null,
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Log the action
    await supabase.from('agent_logs').insert({
      agent: 'pm-agent',
      level: 'info',
      message: `Proposal ${newStatus}: ${proposal.title}`,
      metadata: {
        proposalId,
        action,
        reason,
        reviewedBy: user.email,
      },
    });

    return res.status(200).json({
      success: true,
      proposal: updated,
    });
  } catch (error: any) {
    console.error('[proposals] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
